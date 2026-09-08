'use client';

import { useState, useRef, useEffect } from 'react';
import 'flag-icons/css/flag-icons.min.css';

interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

const COUNTRIES: Country[] = [
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', dialCode: '256' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', dialCode: '254' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', dialCode: '255' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼', dialCode: '250' },
  { code: 'BI', name: 'Burundi', flag: '🇧🇮', dialCode: '257' },
  { code: 'CD', name: 'Democratic Republic of the Congo', flag: '🇨🇩', dialCode: '243' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '27' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '234' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', dialCode: '233' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', dialCode: '251' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', dialCode: '20' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', dialCode: '212' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿', dialCode: '213' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳', dialCode: '216' },
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', dialCode: '225' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳', dialCode: '221' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱', dialCode: '223' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', dialCode: '226' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪', dialCode: '227' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲', dialCode: '237' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦', dialCode: '241' },
  { code: 'CG', name: 'Republic of the Congo', flag: '🇨🇬', dialCode: '242' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴', dialCode: '244' },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼', dialCode: '265' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲', dialCode: '260' },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', dialCode: '263' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿', dialCode: '258' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼', dialCode: '267' },
  { code: 'NA', name: 'Namibia', flag: '🇳🇦', dialCode: '264' },
  { code: 'LS', name: 'Lesotho', flag: '🇱🇸', dialCode: '266' },
  { code: 'SZ', name: 'Eswatini', flag: '🇸🇿', dialCode: '268' },
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬', dialCode: '261' },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺', dialCode: '230' },
  { code: 'SC', name: 'Seychelles', flag: '🇸🇨', dialCode: '248' },
  { code: 'KM', name: 'Comoros', flag: '🇰🇲', dialCode: '269' },
  { code: 'DJ', name: 'Djibouti', flag: '🇩🇯', dialCode: '253' },
  { code: 'ER', name: 'Eritrea', flag: '🇪🇷', dialCode: '291' },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴', dialCode: '252' },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩', dialCode: '249' },
  { code: 'SS', name: 'South Sudan', flag: '🇸🇸', dialCode: '211' },
  { code: 'GM', name: 'Gambia', flag: '🇬🇲', dialCode: '220' },
  { code: 'GN', name: 'Guinea', flag: '🇬🇳', dialCode: '224' },
  { code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼', dialCode: '245' },
  { code: 'LR', name: 'Liberia', flag: '🇱🇷', dialCode: '231' },
  { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱', dialCode: '232' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬', dialCode: '228' },
  { code: 'BJ', name: 'Benin', flag: '🇧🇯', dialCode: '229' },
  { code: 'CF', name: 'Central African Republic', flag: '🇨🇫', dialCode: '236' },
  { code: 'TD', name: 'Chad', flag: '🇹🇩', dialCode: '235' },
  { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶', dialCode: '240' },
  { code: 'ST', name: 'São Tomé and Príncipe', flag: '🇸🇹', dialCode: '239' },
  { code: 'CV', name: 'Cabo Verde', flag: '🇨🇻', dialCode: '238' },
  { code: 'MR', name: 'Mauritania', flag: '🇲🇷', dialCode: '222' },
  { code: 'LY', name: 'Libya', flag: '🇱🇾', dialCode: '218' },
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '44' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '1' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '61' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '49' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '33' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', dialCode: '39' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', dialCode: '34' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', dialCode: '31' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', dialCode: '32' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', dialCode: '41' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', dialCode: '43' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', dialCode: '46' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', dialCode: '47' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', dialCode: '45' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', dialCode: '358' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', dialCode: '48' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', dialCode: '420' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', dialCode: '36' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', dialCode: '30' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', dialCode: '351' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', dialCode: '353' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', dialCode: '7' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', dialCode: '380' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', dialCode: '90' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', dialCode: '972' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', dialCode: '966' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', dialCode: '971' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', dialCode: '974' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', dialCode: '965' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭', dialCode: '973' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', dialCode: '968' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴', dialCode: '962' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧', dialCode: '961' },
  { code: 'SY', name: 'Syria', flag: '🇸🇾', dialCode: '963' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶', dialCode: '964' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷', dialCode: '98' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', dialCode: '92' },
  { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '91' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', dialCode: '880' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', dialCode: '94' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', dialCode: '977' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲', dialCode: '95' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', dialCode: '66' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', dialCode: '84' },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭', dialCode: '855' },
  { code: 'LA', name: 'Laos', flag: '🇱🇦', dialCode: '856' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', dialCode: '60' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', dialCode: '65' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', dialCode: '62' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', dialCode: '63' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '81' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', dialCode: '82' },
  { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '86' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', dialCode: '852' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', dialCode: '886' },
  { code: 'MO', name: 'Macau', flag: '🇲🇴', dialCode: '853' },
  { code: 'MN', name: 'Mongolia', flag: '🇲🇳', dialCode: '976' },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿', dialCode: '7' },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿', dialCode: '998' },
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫', dialCode: '93' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', dialCode: '64' },
  { code: 'FJ', name: 'Fiji', flag: '🇫🇯', dialCode: '679' },
  { code: 'PG', name: 'Papua New Guinea', flag: '🇵🇬', dialCode: '675' },
  { code: 'VU', name: 'Vanuatu', flag: '🇻🇺', dialCode: '678' },
  { code: 'SB', name: 'Solomon Islands', flag: '🇸🇧', dialCode: '677' },
  { code: 'WS', name: 'Samoa', flag: '🇼🇸', dialCode: '685' },
  { code: 'TO', name: 'Tonga', flag: '🇹🇴', dialCode: '676' },
  { code: 'CK', name: 'Cook Islands', flag: '🇨🇰', dialCode: '682' },
  { code: 'NU', name: 'Niue', flag: '🇳🇺', dialCode: '683' },
  { code: 'PW', name: 'Palau', flag: '🇵🇼', dialCode: '680' },
  { code: 'FM', name: 'Federated States of Micronesia', flag: '🇫🇲', dialCode: '691' },
  { code: 'MH', name: 'Marshall Islands', flag: '🇲🇭', dialCode: '692' },
  { code: 'KI', name: 'Kiribati', flag: '🇰🇮', dialCode: '686' },
  { code: 'NR', name: 'Nauru', flag: '🇳🇷', dialCode: '674' },
  { code: 'TV', name: 'Tuvalu', flag: '🇹🇻', dialCode: '688' },
  { code: 'AS', name: 'American Samoa', flag: '🇦🇸', dialCode: '1' },
  { code: 'GU', name: 'Guam', flag: '🇬🇺', dialCode: '1' },
  { code: 'MP', name: 'Northern Mariana Islands', flag: '🇲🇵', dialCode: '1' },
  { code: 'VI', name: 'U.S. Virgin Islands', flag: '🇻🇮', dialCode: '1' },
  { code: 'PR', name: 'Puerto Rico', flag: '🇵🇷', dialCode: '1' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', dialCode: '52' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', dialCode: '55' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', dialCode: '54' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', dialCode: '56' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', dialCode: '57' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', dialCode: '51' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', dialCode: '58' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', dialCode: '593' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', dialCode: '591' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', dialCode: '595' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', dialCode: '598' },
  { code: 'GY', name: 'Guyana', flag: '🇬🇾', dialCode: '592' },
  { code: 'SR', name: 'Suriname', flag: '🇸🇷', dialCode: '597' },
  { code: 'GF', name: 'French Guiana', flag: '🇬🇫', dialCode: '594' },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧', dialCode: '1' },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲', dialCode: '1' },
  { code: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹', dialCode: '1' },
  { code: 'BS', name: 'Bahamas', flag: '🇧🇸', dialCode: '1' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺', dialCode: '53' },
  { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴', dialCode: '1' },
  { code: 'HT', name: 'Haiti', flag: '🇭🇹', dialCode: '509' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦', dialCode: '507' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', dialCode: '506' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮', dialCode: '505' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳', dialCode: '504' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻', dialCode: '503' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹', dialCode: '502' },
  { code: 'BZ', name: 'Belize', flag: '🇧🇿', dialCode: '501' },
];

interface CountryCodeSelectorProps {
  value: string;
  onChange: (dialCode: string) => void;
  className?: string;
}

export default function CountryCodeSelector({ value, onChange, className = '' }: CountryCodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find default Uganda country
  const defaultCountry = COUNTRIES.find(c => c.dialCode === '256') || COUNTRIES[0];
  
  // Find current selected country
  const selectedCountry = COUNTRIES.find(c => c.dialCode === value) || defaultCountry;

  // Filter countries based on search
  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dialCode.includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (country: Country) => {
    onChange(country.dialCode);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-3 border border-gray-300 rounded-l-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-gray-100 min-w-[100px]"
      >
        <span className={`fi fi-${selectedCountry.code.toLowerCase()} text-xl`}></span>
        <span className="text-sm font-medium text-gray-700">+{selectedCountry.dialCode}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No countries found</div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${
                    selectedCountry.dialCode === country.dialCode ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <span className={`fi fi-${country.code.toLowerCase()} text-xl`}></span>
                  <span className="flex-1 text-left">{country.name}</span>
                  <span className="text-gray-500">+{country.dialCode}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
