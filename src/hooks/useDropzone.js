import { useCallback, useState } from "react";

export function useDropzone(onFile) {
  const [isDragging, setIsDragging] = useState(false);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragging(false);
      const [file] = event.dataTransfer.files;
      if (file) onFile(file);
    },
    [onFile],
  );

  return { isDragging, onDragOver, onDragLeave, onDrop };
}
