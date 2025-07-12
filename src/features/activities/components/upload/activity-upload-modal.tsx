// features/activities/components/upload/activity-upload-modal.tsx

"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"; 
import { Button } from "@/components/ui/button"; 
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

interface UploadStatus {
  state: 'idle' | 'file_selected' | 'error';
  message: string;
}

interface ActivityUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityUploadModal: React.FC<ActivityUploadModalProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    state: 'idle',
    message: 'Aguardando seleção do arquivo...',
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];

      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setUploadStatus({ state: 'error', message: "Formato de arquivo inválido. Apenas arquivos CSV são permitidos." });
        toast.error("Formato de arquivo inválido.");
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setUploadStatus({ state: 'file_selected', message: `Arquivo selecionado: ${selectedFile.name}` });
      toast.info(`Arquivo ${selectedFile.name} pronto para upload.`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  const handleSave = () => {
    if (!file) {
      toast.warning("Nenhum arquivo selecionado para salvar.");
      return;
    }

    console.log("Modal funcionando, pronto para processar o arquivo:", file.name);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setUploadStatus({ state: 'idle', message: 'Aguardando seleção do arquivo...' });
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent> 
        <AlertDialogHeader>
          <AlertDialogTitle>Adicionar atividade</AlertDialogTitle>
        </AlertDialogHeader>

        <div
          {...getRootProps()}
          className={cn(
            "group flex flex-col items-center justify-center p-12 text-center rounded-lg border-2 border-dashed transition-colors cursor-pointer",
            isDragActive ? 'border-primary-foreground bg-primary/10' : 'border-gray-300 bg-gray-50 dark:bg-gray-800',
            uploadStatus.state === 'error' ? 'border-destructive' : ''
          )}
        >
          <input {...getInputProps()} />
          
          <div className="flex items-center gap-2 mb-4">
            <Upload className="size-5 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
            <p className="text-sm font-semibold text-foreground">
              Importar dados de um arquivo .csv
            </p>
          </div>
          
          {uploadStatus.state === 'error' && (
            <p className="text-destructive mt-2 text-sm font-medium">{uploadStatus.message}</p>
          )}
        </div>

        <AlertDialogFooter className="flex-row justify-end gap-3 mt-6">
          <AlertDialogCancel asChild>
            <Button className=" font-semibold cursor-pointer transition-colors duration-300" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              className='font-semibold cursor-pointer'
              onClick={handleSave}
              disabled={!file || uploadStatus.state === 'error'}
            >
              Salvar
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};