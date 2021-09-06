"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
function Badge({ className, color, bold, children }) {
    let baseClassName = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const graystyles = bold ? 'border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-gray-50' : 'border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400';
    switch (color) {
        case 'gray':
            baseClassName = `${baseClassName} border ${graystyles}`;
            break;
        default: // red
            baseClassName = `${baseClassName} bg-red-700 dark:bg-red-600 text-white`;
            break;
    }
    return (<div className={`${baseClassName} ${className}`}>
      {children}
    </div>);
}
exports.default = Badge;
