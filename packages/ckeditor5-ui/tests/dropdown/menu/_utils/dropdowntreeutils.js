/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { walkOverDropdownMenuTreeItems } from '../../../../src/dropdown/menu/search/walkoverdropdownmenutreeitems.js';

export function createRootTree( children = [] ) {
	return {
		kind: 'Root',
		children
	};
}

export function mapMenuViewToMenuItemByLabel( label, tree, children = [] ) {
	return mapMenuViewToMenuItem(
		findMenuTreeMenuViewByLabel( label, tree ),
		children
	);
}

export function mapMenuViewToMenuItem( menu, children = [] ) {
	return {
		kind: 'Menu',
		menu,
		search: {
			raw: menu.buttonView.label || '',
			text: ( menu.buttonView.label || '' ).toLowerCase()
		},
		children
	};
}

export function mapButtonViewToFlatMenuItemByLabel( label, tree ) {
	return mapButtonViewToFlatMenuItem(
		findMenuTreeViewFlatItemByLabel( label, tree )
	);
}

export function mapButtonViewToFlatMenuItem( button ) {
	return {
		kind: 'Item',
		item: button,
		search: {
			raw: button.label,
			text: button.label.toLowerCase()
		}
	};
}

export function findMenuTreeMenuViewByLabel( label, tree ) {
	return findMenuTreeNodeByLabel( label, tree ).menu;
}

export function findMenuTreeViewFlatItemByLabel( label, tree ) {
	return findMenuTreeNodeByLabel( label, tree ).item;
}

export function findMenuTreeNodeByLabel( label, tree ) {
	return findAllMenusTreeNodesByLabel( label, tree )[ 0 ];
}

export function findAllMenusTreeNodesByLabel( label, tree ) {
	const foundMenus = [];

	const lookup = ( { node } ) => {
		if ( node.search.raw === label ) {
			foundMenus.push( node );
		}
	};

	walkOverDropdownMenuTreeItems(
		{
			Item: lookup,
			Menu: lookup
		},
		tree
	);

	return foundMenus;
}

export function markAsFound( item ) {
	return {
		...item,
		found: true
	};
}
