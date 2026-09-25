"""Normalize a generated sprite grid into isolated, transparent square cells.

Usage: python scripts/pack-sprite-cells.py INPUT COLUMNS ROWS OUTPUT
Requires Pillow and NumPy. Each source cell is trimmed independently so runtime slicing
cannot sample a neighboring pose; all poses share a 320 px foot anchor.
"""
from pathlib import Path
import sys
from collections import deque
from PIL import Image
import numpy as np


def pack(source: Path, columns: int, rows: int, destination: Path) -> None:
    image = Image.open(source).convert('RGBA')
    pixels = np.asarray(image)
    height, width = pixels.shape[:2]
    solid = (pixels[:, :, 3] >= 80).reshape(-1)
    labels = np.zeros(height * width, dtype=np.int32)
    counts = {}
    split_labels = set()
    next_label = 0
    for seed in np.flatnonzero(solid):
        if labels[seed]:
            continue
        next_label += 1
        queue = deque([int(seed)])
        labels[seed] = next_label
        members = []
        while queue:
            index = queue.popleft()
            members.append(index)
            x = index % width
            for neighbor in (index - width, index + width, index - 1 if x else -1, index + 1 if x < width - 1 else -1):
                if 0 <= neighbor < labels.size and solid[neighbor] and not labels[neighbor]:
                    labels[neighbor] = next_label
                    queue.append(neighbor)
        if len(members) < 120:
            continue
        majority = {}
        for index in members:
            row = min(rows - 1, (index // width) * rows // height)
            column = min(columns - 1, (index % width) * columns // width)
            key = (row, column)
            majority[key] = majority.get(key, 0) + 1
        winner = max(majority, key=majority.get)
        counts[next_label] = winner
        if any(key != winner and amount >= 1000 and amount >= majority[winner] * .22 for key, amount in majority.items()):
            split_labels.add(next_label)
    labels = labels.reshape(height, width)
    source_rows = np.minimum(rows - 1, np.arange(height) * rows // height)[:, None]
    source_columns = np.minimum(columns - 1, np.arange(width) * columns // width)[None, :]
    cell = 320
    atlas = Image.new('RGBA', (columns * cell, rows * cell))
    for row in range(rows):
        for column in range(columns):
            owned = np.isin(labels, [number for number, key in counts.items() if key == (row, column) and number not in split_labels])
            if split_labels:
                owned |= np.isin(labels, list(split_labels)) & (source_rows == row) & (source_columns == column)
            if not owned.any():
                raise ValueError(f'empty pose at column {column}, row {row}')
            selected = pixels.copy()
            selected[~owned, :] = 0
            pose = Image.fromarray(selected, 'RGBA')
            alpha = pose.getchannel('A')
            box = alpha.getbbox()
            pose.putalpha(alpha)
            pose = pose.crop(box)
            ratio = min(288 / pose.width, 288 / pose.height)
            pose = pose.resize((max(1, round(pose.width * ratio)), max(1, round(pose.height * ratio))), Image.Resampling.LANCZOS)
            x = column * cell + (cell - pose.width) // 2
            y = row * cell + 304 - pose.height
            atlas.alpha_composite(pose, (x, y))
    destination.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(destination, optimize=True)


if __name__ == '__main__':
    if len(sys.argv) != 5:
        raise SystemExit(__doc__)
    pack(Path(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3]), Path(sys.argv[4]))
