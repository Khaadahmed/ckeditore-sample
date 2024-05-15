/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/createtreefromflattendropdownmenuslist
 */

import { mapFilter } from '@ckeditor/ckeditor5-utils';

import type { Increment } from '@ckeditor/ckeditor5-core';
import type DropdownMenuView from '../dropdownmenuview.js';

import type { DropdownMenuFocusableFlatItemView } from '../typings.js';
import { isDropdownMenuFocusableFlatItemView, isDropdownMenuView } from '../guards.js';

import { DropdownMenuListItemView } from '../dropdownmenulistitemview.js';
import { createTextSearchMetadata, type WithTreeSearchMetadata } from './dropdownmenutreesearchmetadata.js';

/**
 * Creates a tree structure from a flattened list of dropdown menus.
 *
 * @param menus The array of dropdown menus.
 * @returns The root tree of dropdown menu views.
 */
export function createTreeFromFlattenDropdownMenusList( menus: Array<DropdownMenuView> ): DropdownMenuViewsRootTree {
	// Create a map to store the tree structure of each dropdown menu.
	const menusTreeMap = menus.reduce<Map<DropdownMenuView, DropdownMenuViewsNestedTree>>(
		( acc, menu ) => {
			// Create a nested tree object for each menu and add it to the map.
			acc.set( menu, {
				menu,
				kind: 'Menu',
				children: [],
				search: createTextSearchMetadata( menu.buttonView.label )
			} );

			return acc;
		},
		new Map()
	);

	// Fill the menu tree map with children entries.
	for ( const menu of menus ) {
		const { children } = menusTreeMap.get( menu )!;
		const { listView } = menu;

		for ( const item of listView.items ) {
			if ( !( item instanceof DropdownMenuListItemView ) ) {
				continue;
			}

			const firstContentChild = item.children.first;

			if ( isDropdownMenuFocusableFlatItemView( firstContentChild ) ) {
				// If the item is a flat item, add it to the children array.
				children.push( {
					kind: 'Item',
					item: firstContentChild,
					search: createTextSearchMetadata( firstContentChild.label )
				} );
			} else if ( isDropdownMenuView( firstContentChild ) ) {
				// If the item is a nested menu, find its corresponding tree menu from the map and add it to the children array.
				const maybeTreeMenu = menusTreeMap.get( firstContentChild );

				if ( maybeTreeMenu ) {
					children.push( maybeTreeMenu );
				}
			}
		}
	}

	// Pick only top level menus from the map and assign them to the root entry.
	const rootTree: DropdownMenuViewsRootTree = {
		kind: 'Root',
		children: []
	};

	rootTree.children = Array.from(
		mapFilter( ( _, tree ) => !tree.menu.parentMenuView, menusTreeMap ).values()
	);

	return rootTree;
}

/**
 * Represents a tree entry with a specific kind in a dropdown menu tree.
 */
type WithTreeEntryKind<K extends string> = {
	kind: K;
};

/**
 * The maximum depth of a dropdown menu tree.
 */
type MaxDropdownTreeMenuDepth = 6;

/**
 * Represents a flat item in a dropdown menu tree.
 */
export type DropdownMenuViewsTreeFlatItem<Extend = unknown> =
	& Extend
	& WithTreeEntryKind<'Item'>
	& WithTreeSearchMetadata
	& {
		item: DropdownMenuFocusableFlatItemView;
	};

/**
 * Represents a nested menu entry in a dropdown menu tree.
 */
type DropdownMenuViewsNestedTree<
	Extend = unknown,
	Level extends number = 0
> =
	& Extend
	& WithTreeEntryKind<'Menu'>
	& WithTreeSearchMetadata
	& {
		menu: DropdownMenuView;
		children: MaxDropdownTreeMenuDepth extends Level ? never : Array<DropdownMenuViewsTreeChildItem<Extend, Increment<Level>>>;
	};

/**
 * Represents a child item in a dropdown menu tree.
 */
export type DropdownMenuViewsTreeChildItem<
	Extend = unknown,
	Level extends number = 0
> =
	| DropdownMenuViewsTreeFlatItem<Extend>
	| DropdownMenuViewsNestedTree<Extend, Level>;

/**
 * Represents the root entry of a dropdown menu tree.
 */
export type DropdownMenuViewsRootTree<Extend = unknown> =
	& WithTreeEntryKind<'Root'>
	& {
		children: Array<DropdownMenuViewsTreeChildItem<Extend>>;
	};

/**
 * Represents all possible types of nodes in a dropdown menu tree.
 */
export type DropdownMenusViewsTreeNode<
	Extend = unknown,
	Level extends number = 0
> =
	| DropdownMenuViewsTreeChildItem<Extend, Level>
	| DropdownMenuViewsRootTree<Extend>;

/**
 * Represents the kind of a dropdown menu tree node.
 */
export type DropdownMenusViewsTreeNodeKind = DropdownMenusViewsTreeNode['kind'];

/**
 * Extracts a specific type of dropdown menu tree node by its kind from the dropdown menu tree.
 */
export type ExtractDropdownMenuViewTreeNodeByKind<
	K extends DropdownMenusViewsTreeNodeKind,
	Extend = unknown
> =
	Extract<DropdownMenusViewsTreeNode<Extend>, { kind: K }>;

/**
 * Excludes a specific type of dropdown menu tree node by its kind.
 */
export type ExcludeDropdownMenuViewTreeNodeByKind<
	K extends DropdownMenusViewsTreeNodeKind,
	Extend = unknown
> =
	Exclude<DropdownMenusViewsTreeNode<Extend>, { kind: K }>;
