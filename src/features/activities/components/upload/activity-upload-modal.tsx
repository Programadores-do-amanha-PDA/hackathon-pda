"use client";

import React, { useCallback, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import Papa from 'papaparse';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { cn } from "@/lib/utils";


interface UploadStatus {
  state: 'idle' | 'file_selected' | 'error';
  message?: string | null;
}

interface ActivityUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataParsed: (data: any[]) => void; 
}

export const ActivityUploadModal = ({ isOpen, onClose, onDataParsed}: ActivityUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    state: 'idle',
    message: null,
  });

  const [loading, setLoading] = useState(false);

  // Função para limpar o estado local e chamar o onClose do componente pai
  const handleCloseAndReset = useCallback(() => {
    setFile(null);
    setUploadStatus({ state: 'idle', message: null });
    setLoading(false);
    onClose();
  }, [onClose]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setUploadStatus({
        state: 'file_selected',
        message: `Arquivo ${selectedFile.name} pronto para upload.`,
      });
      setFile(selectedFile);
      toast.info(`Arquivo ${selectedFile.name} selecionado.`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  });

  const handleSave = useCallback(() => {
    if (!file) return;

    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rawData = results.data as any[];

        setTimeout(() => {
          toast.success("Arquivo CSV processado com sucesso!");
          setUploadStatus({
            state: 'file_selected',
            message: "Arquivo lido com sucesso.",
          });
          setLoading(false); 
          onDataParsed(rawData); 
          handleCloseAndReset(); 
        }, 1000);
      },
      error: () => {
        toast.error("Erro ao ler o arquivo.");
        setUploadStatus({ state: 'error', message: "Falha ao ler o CSV." });
        setLoading(false);
      },
    });
  }, [file, onDataParsed, handleCloseAndReset]);


  return (
    <AlertDialog open={isOpen} onOpenChange={handleCloseAndReset}>
      <AlertDialogContent>
        <AlertDialogHeader className="flex flex-row items-center justify-between">
          <AlertDialogTitle>Adicionar atividade</AlertDialogTitle>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCloseAndReset}
            className="text-muted-foreground hover:bg-transparent"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </Button>
        </AlertDialogHeader>
        
        <div
          {...getRootProps()}
          className={cn(
            "group flex flex-col items-center justify-center p-12 text-center rounded-lg border-2 border-dashed transition-colors cursor-pointer",
            isDragActive
              ? "border-primary-foreground bg-primary/10"
              : "border-gray-300 bg-gray-50 dark:bg-gray-800",
            uploadStatus.state === "error" && "border-destructive"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex items-center gap-2 mb-4">
            {!file && (
              <Upload className="size-5 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
            )}
            <p className="text-sm font-semibold text-foreground">
              {file ? `${file.name}` : 'Importar dados de um arquivo .csv'}
            </p>
          </div>

          {uploadStatus.state === "error" && (
            <p className="text-destructive mt-2 text-sm font-medium">{uploadStatus.message}</p>
          )}
        </div>

        {loading && (
          <div className="mt-4 text-center text-sm text-muted-foreground">Carregando dados...</div>
        )}
        
        <AlertDialogFooter className="flex-row justify-end gap-3 mt-6">
          <AlertDialogCancel asChild>
            <Button 
              variant="outline" 
              disabled={loading}
              onClick={handleCloseAndReset}
            >
              Cancelar
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={handleSave}
              disabled={!file || loading}
              className="font-semibold cursor-pointer" 
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};