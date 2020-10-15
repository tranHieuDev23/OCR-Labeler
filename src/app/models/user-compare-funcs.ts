import { UserManagementInfo } from './user';

export function compareByUsername(a: UserManagementInfo, b: UserManagementInfo) {
    return a.user.username.localeCompare(b.user.username);
}

export function compareByDisplayName(a: UserManagementInfo, b: UserManagementInfo) {
    return a.user.displayName.localeCompare(b.user.displayName);
}

export function compareByUploadCount(a: UserManagementInfo, b: UserManagementInfo) {
    return a.uploadCount - b.uploadCount;
}

export function compareByLabelCount(a: UserManagementInfo, b: UserManagementInfo) {
    return a.labelCount - b.labelCount;
}

export function compareByVerifyCount(a: UserManagementInfo, b: UserManagementInfo) {
    return a.verifyCount - b.verifyCount;
}

export function reverseCompareFunc(func: (a: UserManagementInfo, b: UserManagementInfo) => number)
    : (a: UserManagementInfo, b: UserManagementInfo) => number {
    return function (a: UserManagementInfo, b: UserManagementInfo): number {
        return - func(a, b);
    };
}