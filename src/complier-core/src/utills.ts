import { NodeTypes } from "./ast";

export function isTextOrInterpolation(node) {
    return node.type == NodeTypes.TEXT || node.type == NodeTypes.INTERPOLATION
}