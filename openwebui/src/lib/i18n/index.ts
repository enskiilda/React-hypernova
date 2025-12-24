import translations from './locales/pl-PL/translation.json';

type TranslationParams = Record<string, string | number>;

export interface I18nInstance {
        t: (key: string, params?: TranslationParams) => string;
}

const translationsMap: Record<string, string> = translations;

function translate(key: string, params?: TranslationParams): string {
        let result = translationsMap[key];
        
        if (result === undefined || result === '') {
                result = key;
        }
        
        if (params) {
                Object.entries(params).forEach(([paramKey, paramValue]) => {
                        result = result.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), String(paramValue));
                });
        }
        
        return result;
}

export const i18n: I18nInstance = {
        t: translate
};

export const initI18n = (_lang?: string) => {
        document.documentElement.setAttribute('lang', 'pl-PL');
};

export default i18n;
