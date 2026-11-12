// See https://kit.svelte.dev/docs/types#app

import { map, L } from 'leaflet'

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
	interface Window {
		SLMap: typeof map
		L: L
	}
}

export {}
