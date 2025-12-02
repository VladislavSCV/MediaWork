package api

import (
	"fmt"
	"os/exec"
	"path/filepath"
)

func AutoProcessMedia(input string, targetW int, targetH int) (string, error) {
	out := input + "_processed.mp4"

	cmd := exec.Command(
		"ffmpeg",
		"-i", input,
		"-vf", fmt.Sprintf("scale=%d:%d:force_original_aspect_ratio=decrease,pad=%d:%d:(ow-iw)/2:(oh-ih)/2", targetW, targetH, targetW, targetH),
		"-c:v", "libx264", "-preset", "fast", "-crf", "23",
		"-c:a", "aac",
		out,
	)

	if err := cmd.Run(); err != nil {
		return "", err
	}

	return filepath.Base(out), nil
}
