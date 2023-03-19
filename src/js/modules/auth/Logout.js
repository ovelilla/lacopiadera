import { navigator } from "../../app";
import { indexedDB } from "../IndexedDB";

export const logout = async () => {
    await indexedDB.clearRecords("addresses");
    navigator.goTo("/");
};
