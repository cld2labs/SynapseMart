import threading
import uuid
from datetime import datetime, timezone
from typing import Dict, List


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class UploadJobStore:
    def __init__(self):
        self._lock = threading.Lock()
        self._jobs: Dict[str, Dict[str, object]] = {}

    def create(self, total_products: int, batch_size: int) -> Dict[str, object]:
        job_id = str(uuid.uuid4())
        job = {
            "job_id": job_id,
            "status": "queued",
            "total_products": total_products,
            "processed_products": 0,
            "batch_size": batch_size,
            "completed_batches": 0,
            "failed_batches": 0,
            "error": None,
            "created_at": utc_now_iso(),
            "updated_at": utc_now_iso(),
        }
        with self._lock:
            self._jobs[job_id] = job
        return dict(job)

    def update(self, job_id: str, **changes) -> Dict[str, object] | None:
        with self._lock:
            job = self._jobs.get(job_id)
            if not job:
                return None
            job.update(changes)
            job["updated_at"] = utc_now_iso()
            return dict(job)

    def increment(self, job_id: str, **increments) -> Dict[str, object] | None:
        with self._lock:
            job = self._jobs.get(job_id)
            if not job:
                return None
            for key, value in increments.items():
                job[key] = int(job.get(key, 0)) + int(value)
            job["updated_at"] = utc_now_iso()
            return dict(job)

    def get(self, job_id: str) -> Dict[str, object] | None:
        with self._lock:
            job = self._jobs.get(job_id)
            return dict(job) if job else None

    def list_recent(self) -> List[Dict[str, object]]:
        with self._lock:
            return [dict(job) for job in self._jobs.values()]


upload_job_store = UploadJobStore()
