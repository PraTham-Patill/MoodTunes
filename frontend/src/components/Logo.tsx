
import { Link } from 'react-router-dom';
import { Music } from 'lucide-react';

interface LogoProps {
  variant?: 'default' | 'large';
}

const Logo = ({ variant = 'default' }: LogoProps) => {
  const baseClasses = 'flex items-center gap-2 text-primary font-bold transition-opacity duration-300 hover:opacity-80';
  const variantClasses = variant === 'large' ? 'text-2xl md:text-3xl' : 'text-xl';
  
  return (
    <Link to="/" className={`${baseClasses} ${variantClasses}`}>
      <Music className="animate-pulse-slow" size={variant === 'large' ? 28 : 24} />
      <span>MoodTunes</span>
    </Link>
  );
};

export default Logo;
