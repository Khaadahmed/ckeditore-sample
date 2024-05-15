/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/definition/dropdownmenudefinitiontypings
 */

import type { NonEmptyArray } from '@ckeditor/ckeditor5-core';
import type { DropdownMenuOrFlatItemView } from '../typings.js';

/**
 * Represents the definition of a dropdown menu group.
 */
export type DropdownMenuGroupDefinition = {

	/**
	 * An array of items that belong to the dropdown menu group.
	 */
	items: Array<DropdownMenuDefinition | DropdownMenuOrFlatItemView>;
};

/**
 * Represents the definition of a dropdown menu.
 */
export type DropdownMenuDefinition = {
	label: string;
	groups: Array<DropdownMenuGroupDefinition>;
};

/**
 * Represents an array of dropdown menu definitions.
 */
export type DropdownMenuDefinitions = NonEmptyArray<DropdownMenuDefinition>;
