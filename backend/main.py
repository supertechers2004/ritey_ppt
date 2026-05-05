import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from uuid import uuid4
from datetime import datetime, timedelta
from langchain_core.messages import HumanMessage
from langgraph.types import Command
from dotenv import load_dotenv
from groq import RateLimitError
import re
import time
from .database import get_db
from .models import Thread, User
from .graph import create_ckeckpointer_and_graph
from .ppt_generator import PPTGenerator
from .schemas import Ppt, ThreadResponse, ThreadWithStateResponse, UserCreate, UserResponse, Token, CustomPptRequest
from .auth import get_password_hash, verify_password, create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
from fastapi.responses import StreamingResponse
from apscheduler.schedulers.background import BackgroundScheduler
import requests
from urllib.parse import quote_plus

load_dotenv()

BASE_DIT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEDIA_DIR = os.path.join(BASE_DIT,"media")
os.makedirs(MEDIA_DIR,exist_ok=True)
PPT_URL = "postgresql://{}:{}@{}:{}/{}".format(
    os.getenv("DB_USER"),
    quote_plus(os.getenv("DB_PASSWORD", "")),
    os.getenv("DB_HOST", "localhost"),
    os.getenv("DB_PORT", "5432"),
    os.getenv("DB_NAME"),
)
app_state = {
    "checkpointer":None,
    "graph":None
}
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        app_state["checkpointer"], app_state['graph'] = create_ckeckpointer_and_graph(PPT_URL)
        scheduler.add_job(my_job, "interval", minutes=14)
        scheduler.start()
        yield
    finally:
        scheduler.shutdown()
        try:
            if app_state["checkpointer"]:
                pool = app_state["checkpointer"].pool
                if pool:
                    pool.close()
        except Exception as e:
            print(f'Error closing pool: {e}')
def get_graph_deps():
    if not app_state["graph"]:
        raise RuntimeError("Graph not initialized. Check startup logs.")
    if not app_state["checkpointer"]:
        raise RuntimeError("Checkpointer not initialized. Check startup logs.")
    return app_state["checkpointer"], app_state["graph"]

app = FastAPI(lifespan = lifespan)

# Build allowed origins: always include localhost, plus the deployed frontend URL if set
_frontend_url = os.getenv("FRONTEND_URL", "https://frontend-ne8ls9ktw-durgeshs-projects-50c70767.vercel.app")
_allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    _frontend_url,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

scheduler = BackgroundScheduler()

def my_job():
    # RENDER_EXTERNAL_URL is automatically set by Render — falls back to old URL locally
    ping_url = os.getenv("RENDER_EXTERNAL_URL", "https://ppt-ritey.onrender.com").rstrip("/")
    try:
        requests.get(f"{ping_url}/", timeout=10)
    except Exception:
        pass

@app.get("/")
def hellow():
    return {"status":'ok'}

# --- AUTH ENDPOINTS ---
@app.post("/auth/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/auth/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# --- THREAD/STATE ENDPOINTS ---

@app.post("/states/")
def read_root(ppt: Ppt, db: Session = Depends(get_db), deps: tuple = Depends(get_graph_deps), current_user: User = Depends(get_current_user)):
    checkpointer, graph = deps
    config = {'configurable':{'thread_id':ppt.thread_id}}
    try:
        if ppt.topic and ppt.num_slide and ppt.thread_id:
            num_slide = 5 if ppt.num_slide > 5 else ppt.num_slide
            state = {
                "messages": [HumanMessage(content=f"Create a {num_slide}-slide presentation outline on: {ppt.topic}")],
                "topic":ppt.topic,
                "outline": {},
                "detailed_slides": [],
                "current_slide_index": 0,
                "feedback": "",
                "action": "",
                "tool_caller": "generate_outline",
            }
            result =  graph.invoke(state,config = config)['messages'][-1].content
            thread = db.query(Thread).filter(Thread.thread_id == ppt.thread_id, Thread.user_id == current_user.id).first()
            if thread:
                thread.last_update = '1' 
                db.commit() 
                db.refresh(thread)
            return result
        if ppt.feedback:
            state = Command(resume={
                "action": ppt.action,
                "feedback":ppt.feedback
            })
            result =  graph.invoke(state,config = config)['messages'][-1].content
            return result
        
        if ppt.action == 'continue_slide':
            thread = db.query(Thread).filter(Thread.thread_id == ppt.thread_id).first()
            num_slide = 5 if thread.num_slide > 5 else thread.num_slide
            for i in range(num_slide):        
                state = Command(resume={
                    "action": ppt.action,
                })
                result = graph.invoke(state,config = config)
            return result['messages'][-1].content
    except RateLimitError as e:
        wait_match = re.search(r'try again in ([^\.]+)', str(e))
        wait_time = wait_match.group(1) if wait_match else "some time"
        raise HTTPException(
            status_code=429,
            detail={
                "error": "rate_limit",
                "message": f"Groq daily token limit reached. Please try again in {wait_time} or for next 24 hours.",
                "wait_time": wait_time
            }
        )

@app.post('/ppt/')
def generate_ppt(ppt: Ppt, deps: tuple = Depends(get_graph_deps), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    checkpointer, graph = deps
    try:
        thread = db.query(Thread).filter(Thread.thread_id == ppt.thread_id, Thread.user_id == current_user.id).first()
        if not thread:
            raise HTTPException(status_code=404, detail="Thread not found")
        
        config = {"configurable": {"thread_id":ppt.thread_id}}
        state = graph.get_state(config).values
        if not state:
            raise HTTPException(status_code=404, detail="State not found")

        slides = state.get("detailed_slides",[])
        if not slides:
            raise HTTPException(status_code=404, detail="No slide data available.")
        title = state["messages"][0].content.split(':')[-1]

        ppt_obj = PPTGenerator(title, theme_name=thread.theme)
        cover_url = ppt_obj.generate_from_list(slides)
        ppt_file = ppt_obj.save()

        # Save cover image URL as the project preview
        if cover_url:
            thread.img_path = cover_url
            db.commit()

        return StreamingResponse(
                ppt_file,
                media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                headers={
                    "Content-Disposition": f"attachment; filename={title}.pptx"
                }
            )
    except Exception as e:
        print('error',e)
        raise HTTPException(status_code=500,detail=(str(e)))

@app.post('/ppt/custom/')
def generate_custom_ppt(request: CustomPptRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        ppt_obj = PPTGenerator(request.title, theme_name=request.theme)
        cover_url = ppt_obj.generate_from_list(request.slides_data)
        ppt_file = ppt_obj.save()

        # Persist cover image URL into the matching thread
        if cover_url and request.thread_id:
            thread = db.query(Thread).filter(
                Thread.thread_id == request.thread_id,
                Thread.user_id == current_user.id
            ).first()
            if thread:
                thread.img_path = cover_url
                db.commit()

        return StreamingResponse(
                ppt_file,
                media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                headers={
                    "Content-Disposition": f"attachment; filename={request.title}.pptx"
                }
            )
    except Exception as e:
        print('error',e)
        raise HTTPException(status_code=500,detail=(str(e)))

@app.post('/threads/',response_model=ThreadResponse)
def create_threads(ppt: Ppt, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    num_slide = 5 if ppt.num_slide and ppt.num_slide > 5 else ppt.num_slide
    if not num_slide:
        num_slide = 5
    thread = Thread(
        thread_id=str(uuid4()),
        topic=ppt.topic,
        num_slide=num_slide,
        last_update='update',
        user_id=current_user.id,
        theme=ppt.theme
    )
    db.add(thread)
    db.commit()
    db.refresh(thread)
    return thread

@app.get('/threads/{thread_id}',response_model = ThreadWithStateResponse)
def get_threads(thread_id:str, db: Session = Depends(get_db), deps: tuple = Depends(get_graph_deps), current_user: User = Depends(get_current_user)):
    checkpointer, graph = deps
    thread = db.query(Thread).filter(
        Thread.thread_id == thread_id,
        Thread.user_id == current_user.id
    ).first()
    if not thread:
        raise HTTPException(status_code=404, detail='Thread not found')
    config = {'configurable':{'thread_id':thread_id}}
    state = graph.get_state(config).values
    return {
        "thread": thread,
        "outline": state.get('outline',[]),
        "detailed_slides": state.get('detailed_slides',[]),
    }

@app.get('/threads/',response_model = List[ThreadResponse])
def list_threads(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Thread).filter(Thread.user_id == current_user.id).order_by(desc(Thread.updated_at)).all()

@app.put('/threads/{thread_id}/outline')
def update_outline(thread_id: str, outline: List[str], deps: tuple = Depends(get_graph_deps), current_user: User = Depends(get_current_user)):
    checkpointer, graph = deps
    config = {"configurable": {"thread_id": thread_id}}
    try:
        # Update the state in LangGraph
        graph.update_state(config, {"outline": outline})
        return {"message": "Outline updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put('/threads/{thread_id}')
def update_threads(thread_id:str, ppt: Ppt, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    thread = db.query(Thread).filter(
        Thread.thread_id == thread_id,
        Thread.user_id == current_user.id
    ).first()
    if not thread:
        raise HTTPException(status_code=404, detail='Thread not found')
    if ppt.topic:
        thread.topic = ppt.topic 
    if ppt.theme:
        thread.theme = ppt.theme
    db.commit()
    db.refresh(thread)
    return {
        "message":"Thread update successfully",
        "thread": thread
        }

@app.delete('/threads/{thread_id}')
def delete_threads(thread_id:str, db: Session = Depends(get_db), deps: tuple = Depends(get_graph_deps), current_user: User = Depends(get_current_user)):
    checkpointer, graph = deps
    thread = db.query(Thread).filter(
        Thread.thread_id == thread_id,
        Thread.user_id == current_user.id
    ).first()
    if not thread:
        raise HTTPException(status_code=404, detail='Thread not found')
    try:
        checkpointer.delete_thread(thread_id)
    except Exception as e:
        print('delete_threads Exception: ',e)
    db.delete(thread)
    db.commit()
    return {
        "message":"Thread deleted successfully",
        }

@app.get('/sessions/')
def list_sessions(deps: tuple = Depends(get_graph_deps), current_user: User = Depends(get_current_user)):
    # this endpoint seems to list all checkpointer threads. We should ideally filter by user, but skipping complex logic here
    checkpointer, graph = deps
    checkpointers = list(checkpointer.list(config=None))
    thread_id = list({cp.config["configurable"]['thread_id'] for cp in checkpointers})     
    return thread_id

@app.on_event("startup")
def start_scheduler():
    scheduler.add_job(my_job, "interval", seconds=10)
    scheduler.start()

@app.on_event("shutdown")   
def shutdown_scheduler():
    scheduler.shutdown()