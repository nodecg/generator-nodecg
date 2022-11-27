import type { Manifest } from '../src/types/manifest';

declare module 'mocha' {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	export interface Context {
		pkg: Manifest;
	}
}
