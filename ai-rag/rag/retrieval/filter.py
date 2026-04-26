from typing import Optional, Dict


def build_filter(
    grade: Optional[int] = None,
    subject: Optional[str] = None
) -> Dict:
    """
    Build Chroma metadata filter using proper operator format.
    """
    conditions = []

    if grade is not None:
        conditions.append({"grade": {"$eq": grade}})

    if subject is not None:
        conditions.append({"subject": {"$eq": subject}})

    if not conditions:
        return {}

    # 🔥 penting: pakai $and kalau lebih dari 1
    if len(conditions) == 1:
        return conditions[0]

    return {"$and": conditions}