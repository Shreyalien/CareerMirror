import React from "react";
import {
  Rocket,
  Terminal,
  Building2,
  Palette,
  Briefcase,
  Landmark,
  ShieldAlert,
  Globe2,
  TrendingUp,
  Target,
  Flame,
  FileText,
  Users,
  Compass,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Cpu,
  MessageSquare,
  Send,
  Download,
  RotateCcw,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Zap,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Layers,
  Wand2,
  FileCode2,
  HelpCircle,
  FileCheck2,
  Link2,
  Award,
  Edit3,
  Sliders,
  FileSignature,
  History,
  Undo2,
  CheckCheck,
  AlertTriangle,
  CheckCircle,
  Filter,
  BarChart2,
  ListChecks,
  Search,
  Mail,
  MapPin,
  DollarSign,
  Globe,
  Building,
  Lightbulb,
  Star,
  GraduationCap,
  PlusCircle,
  Heart,
  XCircle,
} from "lucide-react";

export function Github({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function BrandLogo({ className = "w-7 h-7", showText = true, textClassName = "text-xl" }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-signal/30 blur-md rounded-lg transform scale-110" />
        <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1E2338] via-[#2A3152] to-[#8B7BFF]/30 border border-signal/40 p-1.5 flex items-center justify-center shadow-lg shadow-signal/10">
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path
              d="M4 4L12 20L20 4L12 11L4 4Z"
              stroke="#8B7BFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 11V20"
              stroke="#4FD1C5"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="4" r="1.5" fill="#FF6B5E" />
          </svg>
        </div>
      </div>
      {showText && (
        <span className={`font-display font-bold tracking-tight text-cloud ${textClassName}`}>
          Career<span className="text-signal">Mirror</span>
        </span>
      )}
    </div>
  );
}

export function PersonaIcon({ personaKey, size = 20, color, className = "", withBadge = false }) {
  const iconProps = {
    size,
    style: color ? { color } : undefined,
    className: `transition-transform duration-200 ${className}`,
    strokeWidth: 2,
  };

  let iconNode;
  switch (personaKey) {
    case "startup":
      iconNode = <Rocket {...iconProps} />;
      break;
    case "faang":
      iconNode = <Terminal {...iconProps} />;
      break;
    case "mnc":
      iconNode = <Building2 {...iconProps} />;
      break;
    case "agency":
      iconNode = <Palette {...iconProps} />;
      break;
    case "freelance":
      iconNode = <Briefcase {...iconProps} />;
      break;
    case "bank":
      iconNode = <Landmark {...iconProps} />;
      break;
    case "cyber":
      iconNode = <ShieldAlert {...iconProps} />;
      break;
    case "ngo":
      iconNode = <Globe2 {...iconProps} />;
      break;
    case "consultancy":
      iconNode = <TrendingUp {...iconProps} />;
      break;
    default:
      iconNode = <Users {...iconProps} />;
  }

  if (withBadge) {
    return (
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300 shadow-sm"
        style={{
          backgroundColor: color ? `${color}14` : "rgba(139, 123, 255, 0.08)",
          borderColor: color ? `${color}33` : "rgba(139, 123, 255, 0.2)",
          boxShadow: color ? `0 0 16px ${color}1A` : "none",
        }}
      >
        {iconNode}
      </div>
    );
  }

  return iconNode;
}

export {
  Rocket,
  Terminal,
  Building2,
  Palette,
  Briefcase,
  Landmark,
  ShieldAlert,
  Globe2,
  TrendingUp,
  Target,
  Flame,
  FileText,
  Users,
  Compass,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Cpu,
  MessageSquare,
  Send,
  Download,
  RotateCcw,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Zap,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Layers,
  Wand2,
  FileCode2,
  HelpCircle,
  FileCheck2,
  Link2,
  Award,
  Edit3,
  Sliders,
  FileSignature,
  History,
  Undo2,
  CheckCheck,
  AlertTriangle,
  CheckCircle,
  Filter,
  BarChart2,
  ListChecks,
  Search,
  Mail,
  MapPin,
  DollarSign,
  Globe,
  Building,
  Lightbulb,
  Star,
  GraduationCap,
  PlusCircle,
  Heart,
  XCircle,
};
