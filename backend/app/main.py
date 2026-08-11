from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import create_db_and_tables
from .routes import router
from .seed import seed_if_empty


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    seed_if_empty()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    # localhost and 127.0.0.1 are different origins to the browser; allow
    # both so the app works regardless of which loopback the dev server
    # is opened on.
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root():
    return {"status": "ok", "service": "uop-library-backend"}
