/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import {makeInner, normalizeToArray} from '../../util/model';
import Model from '../Model';
import { ZRColor, ColorPaletteOptionMixin } from '../../util/types';
import { Dictionary } from 'zrender/src/core/types';

const inner = makeInner<{
    colorIdx: number
    colorNameMap: Dictionary<ZRColor>
}, ColorPaletteMixin>();

function getNearestColorPalette(
    colors: ZRColor[][], requestColorNum: number
): ZRColor[] {
    const paletteNum = colors.length;
    // TODO colors must be in order
    for (let i = 0; i < paletteNum; i++) {
        if (colors[i].length > requestColorNum) {
            return colors[i];
        }
    }
    return colors[paletteNum - 1];
}


interface ColorPaletteMixin<T extends ColorPaletteOptionMixin = ColorPaletteOptionMixin>
    extends Pick<Model<T>, 'get'> {}

class ColorPaletteMixin<T extends ColorPaletteOptionMixin = ColorPaletteOptionMixin> {

    clearColorPalette(this: ColorPaletteMixin) {
        inner(this).colorIdx = 0;
        inner(this).colorNameMap = {};
    }

    /**
     * @param name MUST NOT be null/undefined. Otherwise call this function
     *             twise with the same parameters will get different result.
     * @param scope default this.
     * @return Can be null/undefined
     */
    getColorFromPalette(
        this: ColorPaletteMixin,
        name: string,
        scope?: any,
        requestColorNum?: number
    ): ZRColor {
        scope = scope || this;
        const scopeFields = inner(scope);
        const colorIdx = scopeFields.colorIdx || 0;
        const colorNameMap = scopeFields.colorNameMap = scopeFields.colorNameMap || {};
        // Use `hasOwnProperty` to avoid conflict with Object.prototype.
        if (colorNameMap.hasOwnProperty(name)) {
            return colorNameMap[name];
        }
        const defaultColorPalette = normalizeToArray(this.get('color', true));
        const layeredColorPalette = this.get('colorLayer', true);
        let colorPalette = ((requestColorNum == null || !layeredColorPalette)
            ? defaultColorPalette : getNearestColorPalette(layeredColorPalette, requestColorNum));

        // In case can't find in layered color palette.
        colorPalette = colorPalette || defaultColorPalette;

        if (!colorPalette || !colorPalette.length) {
            return;
        }

        const color = colorPalette[colorIdx];
        if (name) {
            colorNameMap[name] = color;
        }
        scopeFields.colorIdx = (colorIdx + 1) % colorPalette.length;

        return color;
    }
};

export {ColorPaletteMixin};
