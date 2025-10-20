import { LucideIcon } from "lucide-react";

import s from './style.module.scss'
import cn from 'classnames'

interface IconButtonProps {
    icon: LucideIcon;
    onClick: () => void;
    className?: string;
    primary?: boolean;
}

export default function IconButton({ icon: Icon, onClick, className, primary = true }: IconButtonProps) {
    return (
        <button className={cn(s.icon, className, primary && s.primary)} onClick={onClick}>
            <Icon />
        </button>
    )
}