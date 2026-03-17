import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { Ticket, SLA } from '../types';

interface SLAIndicatorProps {
  ticket: Ticket;
  slas: SLA[];
}

export function SLAIndicator({ ticket, slas }: SLAIndicatorProps) {
  // Find applicable SLA
  const applicableSLA = slas.find(sla => 
    sla.isActive && (
      (sla.priority && sla.priority === ticket.priority) ||
      (sla.departmentId && sla.departmentId === ticket.departmentId)
    )
  ) || slas.find(sla => sla.isActive && !sla.priority && !sla.departmentId);

  if (!applicableSLA || ticket.status === 'closed') {
    return null;
  }

  const createdAt = new Date(ticket.createdAt).getTime();
  const now = Date.now();
  const hoursElapsed = (now - createdAt) / (1000 * 60 * 60);

  // Calculate SLA status
  let slaStatus: 'met' | 'at-risk' | 'breached' = 'met';
  let timeRemaining = applicableSLA.resolutionTime - hoursElapsed;
  let message = '';

  if (!ticket.firstResponseAt && hoursElapsed > applicableSLA.firstResponseTime) {
    slaStatus = 'breached';
    message = `First response SLA breached (${applicableSLA.firstResponseTime}h)`;
  } else if (!ticket.firstResponseAt && hoursElapsed > applicableSLA.firstResponseTime * 0.8) {
    slaStatus = 'at-risk';
    message = `First response due in ${(applicableSLA.firstResponseTime - hoursElapsed).toFixed(1)}h`;
  } else if (hoursElapsed > applicableSLA.resolutionTime) {
    slaStatus = 'breached';
    message = `Resolution SLA breached by ${(hoursElapsed - applicableSLA.resolutionTime).toFixed(1)}h`;
  } else if (hoursElapsed > applicableSLA.resolutionTime * 0.8) {
    slaStatus = 'at-risk';
    message = `Due in ${timeRemaining.toFixed(1)}h`;
  } else {
    message = `${timeRemaining.toFixed(1)}h remaining`;
  }

  const getIcon = () => {
    if (slaStatus === 'breached') return <AlertTriangle className="w-3 h-3" />;
    if (slaStatus === 'at-risk') return <Clock className="w-3 h-3" />;
    return <CheckCircle className="w-3 h-3" />;
  };

  const getColor = () => {
    if (slaStatus === 'breached') return 'bg-brand-error-light text-brand-error border-brand-error-mid';
    if (slaStatus === 'at-risk') return 'bg-brand-warning-light text-brand-warning border-brand-warning-mid';
    return 'bg-brand-success-light text-brand-success border-brand-success-mid';
  };

  return (
    <Badge variant="outline" className={`${getColor()} flex items-center gap-1`}>
      {getIcon()}
      <span className="text-xs">{message}</span>
    </Badge>
  );
}