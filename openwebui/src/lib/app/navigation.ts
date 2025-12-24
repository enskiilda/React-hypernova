import { useNavigate, useLocation } from 'react-router-dom';

let navigateRef: ReturnType<typeof useNavigate> | null = null;
let locationRef: ReturnType<typeof useLocation> | null = null;

export const setNavigate = (nav: ReturnType<typeof useNavigate>) => {
        navigateRef = nav;
};

export const setLocation = (loc: ReturnType<typeof useLocation>) => {
        locationRef = loc;
};

export const goto = (path: string) => {
        if (navigateRef) {
                navigateRef(path);
        } else {
                window.location.href = path;
        }
};

export const getLocation = () => locationRef;
