from typing import Tuple, Dict
import yaml


def parse_markdown(filepath: str) -> Tuple[str, Dict]:
    """
    Parse markdown file with YAML frontmatter.
    """
    with open(filepath, "r", encoding="utf-8") as f:
        text = f.read()

    try:
        parts = text.split("---")

        if len(parts) < 3:
            raise ValueError("Invalid markdown format (missing ---)")

        yaml_part = parts[1]
        content_part = parts[2]

        metadata = yaml.safe_load(yaml_part)

        if not isinstance(metadata, dict):
            raise ValueError("Metadata is not valid YAML")

        # 🔥 normalize metadata DI SINI (aman)
        if "subject" in metadata:
            metadata["subject"] = metadata["subject"].lower().strip().replace(" ", "_")

            if metadata["subject"] == "ipa":
                metadata["subject"] = "ilmu_pengetahuan_alam"

        return content_part.strip(), metadata

    except Exception as e:
        raise ValueError(f"Failed parsing {filepath}: {e}")