import React from 'react';
import { X, Download, FileText, Calendar, Building, CheckCircle2 } from 'lucide-react';
import { DigitalDocument } from '../types/employee';

interface DocumentViewerModalProps {
  document: DigitalDocument | null;
  employeeName: string;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document,
  employeeName,
  onClose,
}) => {
  if (!document) return null;

  const handleDownload = () => {
    if (document.fileDataUrl) {
      const link = window.document.createElement('a');
      link.href = document.fileDataUrl;
      link.download = document.fileName || `${document.title}.pdf`;
      link.click();
    } else {
      // Create a downloadable mock text representation of the registered document
      const docContent = `REPÚBLICA BOLIVARIANA DE VENEZUELA\nCONTRALORÍA MUNICIPAL\nEXPEDIENTE DIGITAL DEL TRABAJADOR\n\nDocumento: ${document.title}\nTipo: ${document.type.toUpperCase()}\nFuncionario: ${employeeName}\nArchivo Registrado: ${document.fileName}\nFecha de Carga: ${document.uploadDate}\n${document.gazetteNumber ? `Gaceta Oficial: ${document.gazetteNumber}\nFecha Gaceta: ${document.gazetteDate || 'N/A'}\n` : ''}${document.resolutionNumber ? `Resolución: ${document.resolutionNumber}\n` : ''}\nNotas del Expediente:\n${document.notes || 'Documento debidamente consignado en el archivo físico de la Dirección de Recursos Humanos.'}\n\nESTADO: CONSIGNADO Y VALIDADO EN ARCHIVO DE RRHH\n`;
      const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `${document.fileName || document.title}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const isImage = document.fileType?.startsWith('image/') || document.fileName?.match(/\.(jpeg|jpg|gif|png|webp)$/i);
  const isPdf = document.fileType === 'application/pdf' || document.fileName?.endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-base tracking-tight">{document.title}</h3>
              <p className="text-xs text-slate-300">
                Expediente: {employeeName} · {document.fileName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              Descargar Archivo
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          {/* Metadata banner */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Tipo de Documento:</span>
              <span className="font-semibold text-slate-900 uppercase">
                {document.type === 'curriculum' ? 'Currículum Vitae (Hoja de Vida)' :
                 document.type === 'gaceta' ? 'Gaceta Oficial / Nombramiento' :
                 document.type === 'cedula' ? 'Cédula de Identidad Digital' : document.type}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Fecha de Carga / Registro:</span>
              <span className="font-medium text-slate-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {document.uploadDate}
              </span>
            </div>
            {document.gazetteNumber && (
              <div>
                <span className="text-slate-500 block">N° de Gaceta / Decreto:</span>
                <span className="font-semibold text-blue-700 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" />
                  {document.gazetteNumber}
                </span>
              </div>
            )}
            {document.resolutionNumber && (
              <div>
                <span className="text-slate-500 block">N° de Resolución:</span>
                <span className="font-mono text-slate-800">{document.resolutionNumber}</span>
              </div>
            )}
            {document.notes && (
              <div className="md:col-span-3 pt-2 border-t border-slate-100 text-slate-600">
                <span className="font-semibold text-slate-700">Observaciones: </span>
                {document.notes}
              </div>
            )}
          </div>

          {/* Preview Viewport */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 min-h-[360px] flex flex-col items-center justify-center text-center">
            {document.fileDataUrl && isImage ? (
              <img
                src={document.fileDataUrl}
                alt={document.title}
                className="max-h-[500px] max-w-full object-contain rounded-md shadow-xs border border-slate-200"
              />
            ) : document.fileDataUrl && isPdf ? (
              <iframe
                src={document.fileDataUrl}
                title={document.title}
                className="w-full h-[520px] rounded border border-slate-200"
              />
            ) : (
              /* Simulated Document Inspection Canvas with official seals */
              <div className="w-full max-w-2xl bg-white border border-slate-300 p-8 rounded-sm shadow-xs text-left font-serif relative">
                {/* Official seal watermarking header */}
                <div className="border-b-2 border-slate-800 pb-4 mb-6 text-center font-sans">
                  <div className="text-[11px] font-bold text-slate-800 tracking-wider uppercase">
                    República Bolivariana de Venezuela
                  </div>
                  <div className="text-[10px] text-slate-600 uppercase">
                    Contraloría Municipal · Dirección de Recursos Humanos
                  </div>
                  <div className="text-xs font-bold text-blue-900 mt-1 uppercase">
                    Expediente Digital del Funcionario Público
                  </div>
                </div>

                <div className="space-y-4 text-xs font-sans text-slate-700">
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded border border-slate-200">
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-bold">Documento Consignado:</span>
                      <span className="text-sm font-bold text-slate-900">{document.title}</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      Validado por RRHH
                    </div>
                  </div>

                  {document.type === 'curriculum' ? (
                    <div className="space-y-3 bg-slate-50/50 p-4 rounded border border-slate-100">
                      <h4 className="font-bold text-slate-900 text-xs uppercase border-b border-slate-200 pb-1">
                        Resumen del Currículum Vitae
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        El funcionario <strong className="text-slate-900">{employeeName}</strong> consignó formalmente su Hoja de Vida y Currículum Vitae con soportes académicos, títulos registrados, constancias de servicios previos en la Administración Pública y cursos de formación en control fiscal y auditoría gubernamental.
                      </p>
                      <div className="text-xs text-slate-500">
                        Archivo cargado: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">{document.fileName}</code>
                      </div>
                    </div>
                  ) : document.type === 'gaceta' ? (
                    <div className="space-y-3 bg-amber-50/50 p-4 rounded border border-amber-200/60">
                      <h4 className="font-bold text-amber-950 text-xs uppercase border-b border-amber-200 pb-1">
                        Datos del Acto de Nombramiento
                      </h4>
                      <p className="text-xs text-amber-900 leading-relaxed">
                        Certificación del nombramiento y toma de posesión del cargo en la Contraloría Municipal, publicado en <strong className="text-amber-950">{document.gazetteNumber || 'Gaceta Oficial Municipal'}</strong> {document.gazetteDate ? `de fecha ${document.gazetteDate}` : ''}.
                      </p>
                      {document.resolutionNumber && (
                        <div className="text-xs text-amber-900 font-mono">
                          Número de Resolución Administrativa: <strong>{document.resolutionNumber}</strong>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded text-xs text-slate-600">
                      Archivo digital verificado: {document.fileName}
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500">
                    <div>
                      <p className="font-medium text-slate-700">Dirección de Recursos Humanos</p>
                      <p>Archivo General de Expedientes de Personal</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono">ID: {document.id}</p>
                      <p>Fecha Registro: {document.uploadDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Sistema Integral de Gestión de Recursos Humanos (SIGERH)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 font-medium transition-colors"
          >
            Cerrar Visor
          </button>
        </div>
      </div>
    </div>
  );
};
