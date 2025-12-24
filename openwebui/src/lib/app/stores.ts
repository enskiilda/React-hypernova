import { useLocation, useSearchParams } from 'react-router-dom';

export const usePage = () => {
        const location = useLocation();
        const [searchParams] = useSearchParams();
        
        return {
                url: {
                        pathname: location.pathname,
                        searchParams: searchParams,
                        search: location.search
                }
        };
};
