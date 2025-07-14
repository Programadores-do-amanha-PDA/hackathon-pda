"use client";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";


interface CSVPreviewProps {
  data: any[];
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const CSVPreview = ({ data, isOpen, onClose, onSave }: CSVPreviewProps) => {
  if (!isOpen || data.length === 0) return null;

  const headers = Object.keys(data[0]);

  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a[headers[0]]);
    const dateB = new Date(b[headers[0]]);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-5xl max-h-[90vh] grid-rows-[auto_1fr_auto] p-0 flex flex-col">
        
        <AlertDialogHeader className="px-6 pt-6 pb-4 flex flex-row items-center justify-between border-b">
          <AlertDialogTitle>Controle de atividades</AlertDialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:bg-transparent"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </Button>
        </AlertDialogHeader>
        <div className="overflow-auto w-full flex-1 px-6">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header) => (
                  <TableHead key={header} className="whitespace-nowrap">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((row, i) => (
                <TableRow key={i} className="hover:bg-muted/50">
                  {headers.map((header) => (
                    <TableCell key={header} className="whitespace-nowrap">
                      {row[header]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <AlertDialogFooter className="p-6 border-t flex justify-between sm:flex-row-reverse">
          <div className="flex gap-2">
            <AlertDialogAction asChild>
              <Button onClick={onSave}>Salvar</Button>
            </AlertDialogAction>
            <AlertDialogCancel asChild>
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
            </AlertDialogCancel>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};