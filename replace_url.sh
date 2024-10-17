#!/bin/bash

# Check if a filename was provided
if [ $# -eq 0 ]; then
    echo "Please provide a filename as an argument."
    exit 1
fi

# Store the filename
FILE="$1"

# Check if the file exists
if [ ! -f "$FILE" ]; then
    echo "File not found: $FILE"
    exit 1
fi

# Perform the replacements
sed -i.bak '
    s|data-src="https://editor.p5js.org/mcmanetta/full/nWq7tZF3a"|src="./Hardy-Weinberg-Unsorted/index.html"|g
    s|data-src="https://editor.p5js.org/mcmanetta/full/wFMbhVrzH"|src="./Hardy-Weinberg-Sorted/index.html"|g
    s|data-src="https://editor.p5js.org/mcmanetta/full/IIe6GZhVE"|src="./EvolutionSimulation/index.html"|g
' "$FILE"

# Remove the backup file
rm "${FILE}.bak"

echo "Replacements completed in $FILE"
