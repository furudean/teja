<script>
	import { onMount } from 'svelte'

	/** @type {L.LatLngLiteral[]} */
	export let points

	let mounted = false

	const LENDRUM = {
		lat: 262912 / 256,
		lng: 283136 / 256
	}

	/** @type {HTMLDivElement} */
	let map_element

	/** @type {L.Map}*/
	let map

	/** @type {L.Marker[]} */
	let markers = []

	/**
	 * @param {L.LatLngLiteral} latlng
	 */
	export function render_marker(latlng) {
		// @ts-ignore
		let icon = L.divIcon({
			className: 'leaflet-active-marker',
			iconSize: [5, 5]
		})

		// @ts-ignore
		const marker = L.marker(latlng, { icon })
		markers.push(marker)

		map.addLayer(marker)
	}

	function clear_markers() {
		markers.forEach((marker) => map.removeLayer(marker))
		markers = []
	}

	function update_points() {
		clear_markers()

		points.forEach(render_marker)
	}

	function load_map() {
		map = window.SLMap(map_element)
		map.setView([LENDRUM.lat + 0.5, LENDRUM.lng + 0.5], 8)

		// render_marker(LENDRUM)
	}

	$: mounted && points && update_points()

	onMount(() => {
		mounted = true
		load_map()
	})
</script>

<svelte:head>
	<script src="http://maps.secondlife.com/_scripts/sl.mapapi2.js"></script>
	<link rel="stylesheet" type="text/css" href="http://maps.secondlife.com/_styles/sl.mapapi2.css" />
</svelte:head>

<div class="map" bind:this={map_element} />

<style>
	.map {
		width: 500px;
		height: 500px;
	}

	:global(.leaflet-active-marker) {
		background-color: blue;
		animation: blink 2s step-start infinite;
	}
</style>
