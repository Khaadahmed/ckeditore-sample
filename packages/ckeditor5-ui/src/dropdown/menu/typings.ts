/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/typings
 */

import type ListSeparatorView from '../../list/listseparatorview.js';
import type DropdownMenuListItemButtonView from './dropdownmenulistitembuttonview.js';
import type DropdownMenuView from './dropdownmenuview.js';
import type { DropdownMenuListItemView } from './dropdownmenulistitemview.js';

/**
 * Represents a focusable flat item view in a dropdown menu.
 */
export type DropdownMenuFocusableFlatItemView = DropdownMenuListItemButtonView;

/**
 * Represents the definition of a dropdown menu view item.
 */
export type DropdownMenuOrFlatItemView = DropdownMenuView | DropdownMenuFocusableFlatItemView;

/**
 * Represents a view for a nested menu list item in a dropdown menu.
 * It can be either a `DropdownMenuListItemView` or a `ListSeparatorView`.
 */
export type DropdownNestedMenuListItemView = DropdownMenuListItemView | ListSeparatorView;
