export interface Country {
    code: string;
    name: string;
    flag: string;
}

export const COUNTRIES: Country[] = [
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
    { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
    { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
    { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
    { code: 'ES', name: 'Espagne', flag: '🇪🇸' },
    { code: 'IT', name: 'Italie', flag: '🇮🇹' },
    { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
    { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧' },
    { code: 'NL', name: 'Pays-Bas', flag: '🇳🇱' },
    { code: 'AT', name: 'Autriche', flag: '🇦🇹' },
    { code: 'PL', name: 'Pologne', flag: '🇵🇱' },
    { code: 'SE', name: 'Suède', flag: '🇸🇪' },
    { code: 'DK', name: 'Danemark', flag: '🇩🇰' },
    { code: 'NO', name: 'Norvège', flag: '🇳🇴' },
    { code: 'FI', name: 'Finlande', flag: '🇫🇮' },
    { code: 'IE', name: 'Irlande', flag: '🇮🇪' },
    { code: 'US', name: 'États-Unis', flag: '🇺🇸' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'BR', name: 'Brésil', flag: '🇧🇷' },
    { code: 'AR', name: 'Argentine', flag: '🇦🇷' },
    { code: 'CN', name: 'Chine', flag: '🇨🇳' },
    { code: 'JP', name: 'Japon', flag: '🇯🇵' },
    { code: 'KR', name: 'Corée du Sud', flag: '🇰🇷' },
    { code: 'IN', name: 'Inde', flag: '🇮🇳' },
    { code: 'AU', name: 'Australie', flag: '🇦🇺' },
    { code: 'NZ', name: 'Nouvelle-Zélande', flag: '🇳🇿' },
    { code: 'ZA', name: 'Afrique du Sud', flag: '🇿🇦' },
    { code: 'MA', name: 'Maroc', flag: '🇲🇦' },
    { code: 'TN', name: 'Tunisie', flag: '🇹🇳' },
    { code: 'TR', name: 'Turquie', flag: '🇹🇷' },
    { code: 'GR', name: 'Grèce', flag: '🇬🇷' },
    { code: 'CZ', name: 'Tchéquie', flag: '🇨🇿' },
    { code: 'HU', name: 'Hongrie', flag: '🇭🇺' },
    { code: 'RO', name: 'Roumanie', flag: '🇷🇴' },
    { code: 'RS', name: 'Serbie', flag: '🇷🇸' },
    { code: 'HR', name: 'Croatie', flag: '🇭🇷' },
    { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
    { code: 'RU', name: 'Russie', flag: '🇷🇺' },
];

const flagSvg = (body: string): string => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="18" viewBox="0 0 24 18">' + body + '</svg>';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
};

const horizontal = (colors: string[]): string =>
    colors.map((color, index) => '<rect width="24" height="' + (18 / colors.length) + '" y="' + (index * 18 / colors.length) + '" fill="' + color + '"/>').join('');

const vertical = (colors: string[]): string =>
    colors.map((color, index) => '<rect width="' + (24 / colors.length) + '" height="18" x="' + (index * 24 / colors.length) + '" fill="' + color + '"/>').join('');

export function countryFlagUrl(code: string | null | undefined): string {
    switch (code) {
        case 'FR': return flagSvg(vertical(['#0055a4', '#ffffff', '#ef4135']));
        case 'BE': return flagSvg(vertical(['#000000', '#fdda24', '#ef3340']));
        case 'CH': return flagSvg('<rect width="24" height="18" fill="#d52b1e"/><path d="M10 3h4v5h5v4h-5v5h-4v-5H5V8h5z" fill="#fff"/>');
        case 'LU': return flagSvg(horizontal(['#ed2939', '#ffffff', '#00a1de']));
        case 'DE': return flagSvg(horizontal(['#000000', '#dd0000', '#ffce00']));
        case 'ES': return flagSvg('<rect width="24" height="18" fill="#aa151b"/><rect y="4" width="24" height="10" fill="#f1bf00"/>');
        case 'IT': return flagSvg(vertical(['#009246', '#ffffff', '#ce2b37']));
        case 'PT': return flagSvg('<rect width="24" height="18" fill="#ff0000"/><rect width="9" height="18" fill="#046a38"/><circle cx="9" cy="9" r="3" fill="#f9d616"/>');
        case 'GB': return flagSvg('<rect width="24" height="18" fill="#012169"/><path d="M0 0l24 18M24 0L0 18" stroke="#fff" stroke-width="4"/><path d="M0 0l24 18M24 0L0 18" stroke="#c8102e" stroke-width="1.5"/><path d="M12 0v18M0 9h24" stroke="#fff" stroke-width="6"/><path d="M12 0v18M0 9h24" stroke="#c8102e" stroke-width="3"/>');
        case 'NL': return flagSvg(horizontal(['#ae1c28', '#ffffff', '#21468b']));
        case 'AT': return flagSvg(horizontal(['#ed2939', '#ffffff', '#ed2939']));
        case 'PL': return flagSvg(horizontal(['#ffffff', '#dc143c']));
        case 'SE': return flagSvg('<rect width="24" height="18" fill="#006aa7"/><path d="M7 0h3v18H7zM0 7h24v3H0z" fill="#fecc00"/>');
        case 'DK': return flagSvg('<rect width="24" height="18" fill="#c8102e"/><path d="M7 0h3v18H7zM0 7h24v3H0z" fill="#fff"/>');
        case 'NO': return flagSvg('<rect width="24" height="18" fill="#ba0c2f"/><path d="M6 0h5v18H6zM0 6h24v6H0z" fill="#fff"/><path d="M7 0h3v18H7zM0 7h24v4H0z" fill="#00205b"/>');
        case 'FI': return flagSvg('<rect width="24" height="18" fill="#fff"/><path d="M6 0h4v18H6zM0 7h24v4H0z" fill="#003580"/>');
        case 'IE': return flagSvg(vertical(['#169b62', '#ffffff', '#ff883e']));
        case 'US': return flagSvg('<rect width="24" height="18" fill="#b22234"/><path d="M0 2h24v2H0M0 6h24v2H0M0 10h24v2H0M0 14h24v2H0" stroke="#fff" stroke-width="2"/><rect width="10" height="10" fill="#3c3b6e"/>');
        case 'CA': return flagSvg('<rect width="24" height="18" fill="#fff"/><rect width="6" height="18" fill="#d52b1e"/><rect x="18" width="6" height="18" fill="#d52b1e"/><path d="M12 3l1 4 3-1-2 3 3 2-4 0-1 4-1-4-4 0 3-2-2-3 3 1z" fill="#d52b1e"/>');
        case 'BR': return flagSvg('<rect width="24" height="18" fill="#009c3b"/><path d="M12 2l9 7-9 7-9-7z" fill="#ffdf00"/><circle cx="12" cy="9" r="3.5" fill="#002776"/>');
        case 'AR': return flagSvg(horizontal(['#74acdf', '#ffffff', '#74acdf']));
        case 'CN': return flagSvg('<rect width="24" height="18" fill="#de2910"/><circle cx="5" cy="5" r="2.5" fill="#ffde00"/>');
        case 'JP': return flagSvg('<rect width="24" height="18" fill="#fff"/><circle cx="12" cy="9" r="4" fill="#bc002d"/>');
        case 'KR': return flagSvg('<rect width="24" height="18" fill="#fff"/><circle cx="12" cy="9" r="4" fill="#c60c30"/><path d="M12 9a4 4 0 0 0 0 8 4 4 0 0 1 0-8" fill="#003478"/>');
        case 'IN': return flagSvg(horizontal(['#ff9933', '#ffffff', '#138808']) + '<circle cx="12" cy="9" r="2" fill="#000080"/>');
        case 'AU': return flagSvg('<rect width="24" height="18" fill="#00008b"/><rect width="10" height="8" fill="#012169"/><path d="M0 0l10 8M10 0L0 8" stroke="#fff" stroke-width="2"/><path d="M5 0v8M0 4h10" stroke="#c8102e" stroke-width="1"/><circle cx="17" cy="12" r="1.5" fill="#fff"/>');
        case 'NZ': return flagSvg('<rect width="24" height="18" fill="#00247d"/><rect width="10" height="8" fill="#012169"/><path d="M0 0l10 8M10 0L0 8" stroke="#fff" stroke-width="2"/><path d="M5 0v8M0 4h10" stroke="#c8102e" stroke-width="1"/><circle cx="17" cy="12" r="1.5" fill="#cc142b"/>');
        case 'ZA': return flagSvg('<rect width="24" height="18" fill="#007a4d"/><path d="M0 0l12 9L0 18z" fill="#ffb81c"/><path d="M0 0l12 9L0 18" stroke="#de3831" stroke-width="5"/><path d="M0 0l12 9L0 18" stroke="#000" stroke-width="2"/>');
        case 'MA': return flagSvg('<rect width="24" height="18" fill="#c1272d"/><path d="M12 4l1.5 3.5 3.8.2-3 2.4 1 3.7-3.3-2.1-3.3 2.1 1-3.7-3-2.4 3.8-.2z" fill="#006233"/>');
        case 'TN': return flagSvg('<rect width="24" height="18" fill="#e70013"/><circle cx="12" cy="9" r="4.5" fill="#fff"/><circle cx="12" cy="9" r="2.5" fill="#e70013"/>');
        case 'TR': return flagSvg('<rect width="24" height="18" fill="#e30a17"/><circle cx="10" cy="9" r="4" fill="#fff"/><circle cx="11" cy="9" r="3.2" fill="#e30a17"/><path d="M14 6l1 3 3 .1-2.4 1.8.8 3-2.4-1.8" fill="#fff"/>');
        case 'GR': return flagSvg(horizontal(['#0d5eaf', '#fff', '#0d5eaf', '#fff', '#0d5eaf', '#fff', '#0d5eaf', '#fff', '#0d5eaf']));
        case 'CZ': return flagSvg('<rect width="24" height="18" fill="#fff"/><rect y="9" width="24" height="9" fill="#d7141a"/><path d="M0 0l12 9L0 18z" fill="#11457e"/>');
        case 'HU': return flagSvg(horizontal(['#ce2939', '#fff', '#477050']));
        case 'RO': return flagSvg(vertical(['#002b7f', '#fcd116', '#ce1126']));
        case 'RS': return flagSvg(horizontal(['#c6363c', '#0c4076', '#fff']));
        case 'HR': return flagSvg(horizontal(['#ff0000', '#fff', '#171796']));
        case 'UA': return flagSvg(horizontal(['#0057b7', '#ffd700']));
        case 'RU': return flagSvg(horizontal(['#fff', '#0039a6', '#d52b1e']));
        default: return '';
    }
}
