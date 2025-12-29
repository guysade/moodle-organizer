from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.resource import Resource
from app.models.course import Course
from app.config import settings
import httpx
import os
import shutil
import tempfile
import zipfile
import asyncio

router = APIRouter(prefix="/api/resources", tags=["Resources"])

@router.get("/")
async def get_resources(course_id: int = None, db: AsyncSession = Depends(get_db)):
    query = select(Resource)
    if course_id:
        query = query.where(Resource.course_id == course_id)

    result = await db.execute(query.order_by(Resource.time_created.desc()))
    resources = result.scalars().all()

    return [
        {
            "id": r.id,  # Use database primary key, not moodle_id (which is not unique)
            "moodle_id": r.moodle_id,
            "course_id": r.course_id,
            "filename": r.filename,
            "section": r.section,
            "download_url": f"{r.file_url}&token={settings.moodle_token}",
            "mimetype": r.mimetype,
            "filesize": r.filesize,
            "is_new": r.is_new,
            "time_created": r.time_created.isoformat() if r.time_created else None
        }
        for r in resources
    ]

def remove_file(path: str):
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception as e:
        print(f"Error deleting file {path}: {e}")

@router.get("/download-zip/{course_id}")
async def download_course_zip(course_id: int, flat: bool = False, background_tasks: BackgroundTasks = None, db: AsyncSession = Depends(get_db)):
    # Get course info
    course_stmt = select(Course).where(Course.moodle_id == course_id)
    course_res = await db.execute(course_stmt)
    course = course_res.scalar_one_or_none()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Get all resources for the course
    stmt = select(Resource).where(Resource.course_id == course_id)
    result = await db.execute(stmt)
    resources = result.scalars().all()

    if not resources:
        raise HTTPException(status_code=404, detail="No resources found for this course")

    # Create temporary directory
    temp_dir = tempfile.mkdtemp()
    zip_filename = f"{course.shortname}_files.zip".replace(" ", "_")
    zip_path = os.path.join(tempfile.gettempdir(), zip_filename)

    try:
        async with httpx.AsyncClient() as client:
            tasks = []
            filenames_count = {}  # Track duplicate filenames for flat mode

            for resource in resources:
                download_url = f"{resource.file_url}&token={settings.moodle_token}"

                if flat:
                    # Flat mode: all files in root, handle duplicates
                    base_filename = resource.filename
                    if base_filename in filenames_count:
                        filenames_count[base_filename] += 1
                        name, ext = os.path.splitext(base_filename)
                        actual_filename = f"{name}_{filenames_count[base_filename]}{ext}"
                    else:
                        filenames_count[base_filename] = 0
                        actual_filename = base_filename
                    file_path = os.path.join(temp_dir, actual_filename)
                else:
                    # Organized mode: files in section folders
                    section_name = resource.section if resource.section else "General"
                    section_name = "".join([c for c in section_name if c.isalnum() or c in (' ', '-', '_')]).strip()
                    section_dir = os.path.join(temp_dir, section_name)
                    os.makedirs(section_dir, exist_ok=True)
                    file_path = os.path.join(section_dir, resource.filename)

                async def download_file(url, path):
                    try:
                        resp = await client.get(url, follow_redirects=True, timeout=30.0)
                        if resp.status_code == 200:
                            with open(path, "wb") as f:
                                f.write(resp.content)
                    except Exception as e:
                        print(f"Error downloading {url}: {e}")

                tasks.append(download_file(download_url, file_path))

            # Download concurrently
            await asyncio.gather(*tasks)

        # Create ZIP file
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            if flat:
                # Flat: just list files in temp_dir
                for file in os.listdir(temp_dir):
                    file_path = os.path.join(temp_dir, file)
                    if os.path.isfile(file_path):
                        zipf.write(file_path, file)
            else:
                # Organized: preserve folder structure
                for root, dirs, files in os.walk(temp_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, temp_dir)
                        zipf.write(file_path, arcname)

    finally:
        # Cleanup temp directory
        shutil.rmtree(temp_dir)

    # Schedule cleanup of zip file
    background_tasks.add_task(remove_file, zip_path)

    return FileResponse(
        zip_path,
        media_type='application/zip',
        filename=zip_filename
    )

@router.get("/download-all-zip")
async def download_all_resources_zip(background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """Download all resources from all courses as a flat zip (no folders)"""
    # Get all resources
    stmt = select(Resource)
    result = await db.execute(stmt)
    resources = result.scalars().all()

    if not resources:
        raise HTTPException(status_code=404, detail="No resources found")

    # Create temporary directory
    temp_dir = tempfile.mkdtemp()
    zip_filename = "all_course_materials.zip"
    zip_path = os.path.join(tempfile.gettempdir(), zip_filename)

    try:
        async with httpx.AsyncClient() as client:
            tasks = []
            filenames_count = {}  # Track duplicate filenames

            for resource in resources:
                download_url = f"{resource.file_url}&token={settings.moodle_token}"

                # Handle duplicate filenames by adding a suffix
                base_filename = resource.filename
                if base_filename in filenames_count:
                    filenames_count[base_filename] += 1
                    name, ext = os.path.splitext(base_filename)
                    actual_filename = f"{name}_{filenames_count[base_filename]}{ext}"
                else:
                    filenames_count[base_filename] = 0
                    actual_filename = base_filename

                file_path = os.path.join(temp_dir, actual_filename)

                async def download_file(url, path):
                    try:
                        resp = await client.get(url, follow_redirects=True, timeout=30.0)
                        if resp.status_code == 200:
                            with open(path, "wb") as f:
                                f.write(resp.content)
                    except Exception as e:
                        print(f"Error downloading {url}: {e}")

                tasks.append(download_file(download_url, file_path))

            # Download concurrently
            await asyncio.gather(*tasks)

        # Create ZIP file (flat structure - all files in root)
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file in os.listdir(temp_dir):
                file_path = os.path.join(temp_dir, file)
                if os.path.isfile(file_path):
                    zipf.write(file_path, file)

    finally:
        # Cleanup temp directory
        shutil.rmtree(temp_dir)

    # Schedule cleanup of zip file
    background_tasks.add_task(remove_file, zip_path)

    return FileResponse(
        zip_path,
        media_type='application/zip',
        filename=zip_filename
    )

@router.get("/new")
async def get_new_resources(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Resource)
        .where(Resource.is_new == True)
        .order_by(Resource.time_created.desc())
        .limit(20)
    )
    resources = result.scalars().all()

    return [
        {
            "id": r.id,  # Use database primary key, not moodle_id (which is not unique)
            "moodle_id": r.moodle_id,
            "course_id": r.course_id,
            "filename": r.filename,
            "section": r.section,
            "download_url": f"{r.file_url}&token={settings.moodle_token}",
            "mimetype": r.mimetype,
            "filesize": r.filesize,
            "is_new": r.is_new,
            "time_created": r.time_created.isoformat() if r.time_created else None
        }
        for r in resources
    ]
