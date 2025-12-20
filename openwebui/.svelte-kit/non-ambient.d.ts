
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/(app)" | "/" | "/(app)/c" | "/(app)/c/[id]";
		RouteParams(): {
			"/(app)/c/[id]": { id: string }
		};
		LayoutParams(): {
			"/(app)": { id?: string };
			"/": { id?: string };
			"/(app)/c": { id?: string };
			"/(app)/c/[id]": { id: string }
		};
		Pathname(): "/" | "/c" | "/c/" | `/c/${string}` & {} | `/c/${string}/` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/assets/fonts/Archivo-Variable.ttf" | "/assets/fonts/InstrumentSerif-Regular.ttf" | "/assets/fonts/Inter-Variable.ttf" | "/assets/fonts/Mona-Sans.woff2" | "/assets/fonts/Vazirmatn-Variable.ttf" | "/manifest.json" | "/robots.txt" | "/static/apple-touch-icon.png" | "/static/favicon.ico" | "/static/favicon.png" | "/static/favicon.svg" | "/static/logo.png" | "/static/site.webmanifest" | "/static/user.png" | "/static/web-app-manifest-192x192.png" | "/static/web-app-manifest-512x512.png" | string & {};
	}
}