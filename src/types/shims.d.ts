/* eslint-disable @typescript-eslint/no-explicit-any */

// Lightweight shims for third-party libs that don't ship types (keeps tsc quiet)
declare module 'react-day-picker';

declare module 'embla-carousel-react' {
	export type UseEmblaCarouselType = [
		(el?: HTMLElement | null) => void | null,
		{
			scrollPrev: () => void
			scrollNext: () => void
			canScrollPrev: () => boolean
			canScrollNext: () => boolean
			on: (ev: string, cb: (...args: any[]) => void) => void
			off: (ev: string, cb: (...args: any[]) => void) => void
		}
	]

	export default function useEmblaCarousel(opts?: any, plugins?: any): UseEmblaCarouselType
}

declare module 'cmdk';
declare module 'vaul';

declare module 'input-otp' {
	import * as React from 'react'
	export const OTPInput: React.ComponentType<any>
	export const OTPInputContext: React.Context<any>
}

declare module 'react-resizable-panels';

declare module 'otp-input-react';
declare module 'react-hot-toast';
declare module '@radix-ui/react-icons' {
	import * as React from 'react'
	export const ChevronLeftIcon: React.ComponentType<any>
	export const ChevronRightIcon: React.ComponentType<any>
	export const MinusIcon: React.ComponentType<any>
}

declare module 'otp-input-react';

declare module 'react-hot-toast';

// Allow importing JSON-like objects from some legacy libs
declare module '*.png';
declare module '*.svg';
