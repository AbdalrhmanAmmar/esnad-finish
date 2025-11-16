import React from 'react';
import { Button } from './ui/button';
import { Globe, Languages } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const LanguageToggle: React.FC = () => {
  const { currentLanguage, changeLanguage, t } = useLanguage();

  const languages = [
    { code: 'ar', name: t('common.arabic'), flag: '🇸🇦' },
    { code: 'en', name: t('common.english'), flag: '🇺🇸' },
  ];

  const currentLangData = languages.find(lang => lang.code === currentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 px-0 hover:bg-accent/50 transition-all duration-200"
        >
          <div className="flex items-center justify-center">
            {currentLangData ? (
              <span className="text-lg">{currentLangData.flag}</span>
            ) : (
              <Globe className="h-4 w-4" />
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`flex items-center gap-3 cursor-pointer transition-colors ${
              currentLanguage === language.code
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent/50'
            }`}
          >
            <span className="text-lg">{language.flag}</span>
            <div className="flex flex-col">
              <span className="font-medium">{language.name}</span>
              <span className="text-xs text-muted-foreground uppercase">
                {language.code}
              </span>
            </div>
            {currentLanguage === language.code && (
              <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;