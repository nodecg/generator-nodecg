import type { PackageJson } from 'type-fest';

export type Manifest = PackageJson.PackageJsonStandard & {
	nodecg: UnparsedNodeCGManifest;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export type UnparsedNodeCGManifest = {
	compatibleRange: string;
	transformBareModuleSpecifiers?: boolean;
	dashboardPanels?: UnparsedPanel[];
	graphics?: UnparsedGraphic[];
	assetCategories?: UnparsedAssetCategory[];
	mount?: UnparsedMount[];
	soundCues?: UnparsedSoundCue[];
	bundleDependencies?: UnparsedBundleDependencies;
};

export type UnparsedAssetCategory = {
	name: string;
	title: string;
	allowedTypes?: string[];
};

export type UnparsedPanel = {
	name: string;
	title: string;
	file: string;
	headerColor?: string;
	fullbleed?: boolean;
	workspace?: string;
	dialog?: boolean;
	dialogButtons?: Array<{ name: string; type: 'dismiss' | 'confirm' }>;
	width?: number;
};

export type UnparsedGraphic = {
	file: string;
	width: number;
	height: number;
	singleInstance?: boolean;
};

export type UnparsedMount = {
	directory: string;
	endpoint: string;
};

export type UnparsedSoundCue = {
	name: string;
	assignable?: boolean;
	defaultVolume?: number;
	defaultFile?: string;
};

export type UnparsedBundleDependencies = Record<string, string>;
