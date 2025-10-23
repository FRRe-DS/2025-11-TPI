import React, { useState, useRef } from 'react';
import { theme } from '../../styles/theme';

// Estilos para el dropzone
const styles: { [key: string]: React.CSSProperties } = {
  dropzone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    border: `2px dashed ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background, // Un fondo ligeramente diferente
    color: theme.colors.textSecondary,
    cursor: 'pointer',
    transition: 'background-color 0.2s, border-color 0.2s',
    minHeight: '150px',
  },
  dropzoneActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface, // Un color que indique "activo"
  },
  dropzoneText: {
    margin: 0,
    fontSize: theme.fontSizes.body,
    fontWeight: '500',
  },
  dropzoneSubText: {
    margin: 0,
    fontSize: theme.fontSizes.small,
    marginTop: theme.spacing.xs,
  },
  fileName: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSizes.small,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  removeButton: {
    background: 'none',
    border: 'none',
    color: theme.colors.danger,
    cursor: 'pointer',
    fontSize: theme.fontSizes.small,
    marginLeft: theme.spacing.sm,
  },
};

// Props que recibirá el componente
interface ImageDropzoneProps {
  onFileChange: (file: File | null) => void; // Función para notificar al padre
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onFileChange,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Maneja el archivo (tanto de drop como de click)
  const handleFile = (file: File) => {
    // Aquí podrías validar el tipo de archivo (ej. file.type.startsWith('image/'))
    setFileName(file.name);
    onFileChange(file);
  };

  // --- Handlers de Drag and Drop ---
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // --- Handlers de Click ---
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // --- Limpiar archivo ---
  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que el click active el 'handleClick' del div
    setFileName(null);
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Resetea el input
    }
  };

  const currentStyle = {
    ...styles.dropzone,
    ...(isDragOver ? styles.dropzoneActive : {}),
  };

  return (
    <div
      style={currentStyle}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*" // Acepta solo imágenes
        style={{ display: 'none' }} // El input está oculto
      />
      {!fileName ? (
        <>
          <p style={styles.dropzoneText}>Arrastra una imagen aquí</p>
          <p style={styles.dropzoneSubText}>o haz click para seleccionarla</p>
        </>
      ) : (
        <>
          <p style={styles.dropzoneText}>Archivo seleccionado:</p>
          <div style={styles.fileName}>
            {fileName}
            <button style={styles.removeButton} onClick={handleRemoveFile}>
              (Quitar)
            </button>
          </div>
        </>
      )}
    </div>
  );
};
