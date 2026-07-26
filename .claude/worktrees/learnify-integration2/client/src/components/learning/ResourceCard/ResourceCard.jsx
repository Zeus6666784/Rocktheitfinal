import { Download, FileText, FileArchive, FileType, Presentation } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../utils/cn';

const typeIcon = {
  pdf: FileText,
  zip: FileArchive,
  doc: FileType,
  ppt: Presentation,
};

/**
 * ResourceCard
 * Downloadable resource row. Per COMPONENT_CONTRACT.md:
 *   icon, title, description, fileUrl, type
 * type: pdf | zip | doc | ppt
 */
export default function ResourceCard({
  icon: IconProp,
  title,
  description,
  fileUrl,
  type = 'pdf',
  className,
}) {
  const Icon = IconProp || typeIcon[type] || FileText;

  return (
    <motion.a
      href={fileUrl}
      download
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group flex items-center gap-4 p-4 rounded-image bg-surface',
        'border border-line hover:border-primary/40 hover:shadow-medium',
        'transition-all duration-200',
        className,
      )}
    >
      <div className="h-12 w-12 shrink-0 rounded-btn bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-body font-medium text-ink truncate">{title}</h4>
        {description ? (
          <p className="text-small text-ink-muted truncate">{description}</p>
        ) : null}
      </div>

      <div className="shrink-0 flex items-center gap-2 text-primary group-hover:text-primary-light transition-colors">
        <span className="text-small font-medium hidden sm:inline">Download</span>
        <Download className="h-5 w-5" aria-hidden="true" />
      </div>
    </motion.a>
  );
}
