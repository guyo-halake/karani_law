from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/v1/documents", tags=["Document Vault"])

class DocumentMetadata(BaseModel):
    name: str
    folder_id: Optional[str] = None
    matter_id: Optional[str] = None
    mime_type: str = "application/pdf"
    file_size: int = 0
    tags: List[str] = []

@router.post("/process-metadata")
def process_document_metadata(doc: DocumentMetadata):
    """Processes legal document upload metadata, generating tags and index hashes."""
    auto_tags = list(doc.tags)
    if "bill" in doc.name.lower() or "cost" in doc.name.lower():
        auto_tags.append("taxation")
    if "plaint" in doc.name.lower() or "defence" in doc.name.lower():
        auto_tags.append("pleading")
        
    return {
        "success": True,
        "document": {
            "name": doc.name,
            "folder_id": doc.folder_id,
            "mime_type": doc.mime_type,
            "file_size_formatted": f"{round(doc.file_size / 1024, 1)} KB",
            "tags": list(set(auto_tags)),
            "processed": True
        }
    }
