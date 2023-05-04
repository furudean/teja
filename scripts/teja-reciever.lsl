string API_BASE_URL = "https://teja.himawari.fun";
string VERSION = "1.2";

// [ uuid, object_return, username, ... ]
list troublemakers;

list managed_bans = [];
key ban_query_request_id;
integer permissions;
integer is_setup;


list StrideOfList(list src, integer stride, integer start, integer end) {
    list l = [];
    integer ll = llGetListLength(src);

    if (start < 0) start += ll;
    if (end < 0) end += ll;
    if (end < start) return llList2List(src, start, start);

    while(start <= end)
    {
        l += llList2List(src, start, start);
        start += stride;
    }

    return l;
}


list ListItemDelete(list mylist, key element_old) {
    integer placeinlist = llListFindList(mylist, [element_old]);
    if (placeinlist != -1)
        return llDeleteSubList(mylist, placeinlist, placeinlist);
    return mylist;
}


integer IsInList(list list_, string item) {
    return llListFindList(list_, [item]) != -1
}


check_perms() {
    key pressed = llDetectedKey(0);
    key owner = llGetOwner();
    key land_owner = llGetLandOwnerAt(llGetPos());
    // key object_creator = llGetCreator();

    // if (pressed != object_creator) { return; }

    if (land_owner != owner) {
        llSay(0, "object owner and land owner are NOT the same... please deed this prim to land so that i have the right permissions!");
        return;
    }

    if (!permissions) {
        llSay(0, "allow teja to return objects of troublemakers? (you should see a dialog)");
        llRequestPermissions(pressed, PERMISSION_RETURN_OBJECTS);
        return;
    }

    is_setup = TRUE
}


default {
    state_entry() {
        check_perms();
    }

    touch_start(integer num_detected) {
        check_perms();

        if (is_setup == TRUE) {
            state active;
        }
    }

    run_time_permissions(integer new_permissions) {
        permissions = new_permissions;

        if (PERMISSION_RETURN_OBJECTS & permissions) {
            llSay(pressed, 0, "OK! objects may be returned by script.");
        } else {
            llSay(pressed, 0, "OK! objects will NOT be returned!");
        }

        check_perms();

        if (is_setup == TRUE) {
            state active;
        }
    }
}


heartbeat() {
    string url = API_BASE_URL + "/heartbeat?version=" + llEscapeURL(version);
    llHTTPRequest(url, [], "");
}

query_bans() {
    ban_query_request_id = llHTTPRequest(API_BASE_URL + "/bans", [], "");
}

update_land_bans() {
    list ban_uuids = StrideOfList(troublemakers, 3, 0, -1);
    list ban_return_objects = StrideOfList(troublemakers, 3, 1, -1);
    list ban_usernames = StrideOfList(troublemakers, 3, 2, -1);    

    list managed_bans_copy = llList2List(managed_bans, 0, -1);

    // handle revoked ban
    integer i;
    for (;i < llGetListLength(managed_bans);i++) {
        key uuid = llList2Key(managed_bans_copy, i);

        if (!IsInList(ban_uuids, uuid)) {
            llRemoveFromLandBanList(uuid);
            managed_bans = ListItemDelete(managed_bans, uuid);
        }
    }

    integer strides = llGetListLength(troublemakers) / 3;

    // handle new ban / object return
    integer j;
    for (;j < strides;j++) {
        key uuid = llList2Key(ban_uuids, j);
        integer return_objects = llList2Integer(ban_return_objects, j);

        if (return_objects && (PERMISSION_RETURN_OBJECTS & permissions)) {
            llReturnObjectsByOwner(uuid, OBJECT_RETURN_PARCEL);
        }

        if (!IsInList(managed_bans, uuid)) {
            llAddToLandBanList(uuid, 0);
            managed_bans += uuid;
        }
    }
}

state active {
    state_entry() {
        llSay(0, "teja client setup OK! check https://teja.himawari.fun/status for status");
        llSay(0, "if you want to change any settings, please reset this script!");
    }

    timer() {
        query_bans();
        heartbeat();

        llSetTimerEvent(120.0);
    }

    http_response(key request_id, integer status, list metadata, string body) {
        if (status >= 500) { 
            llSay(0, "bad response from api!");
            return;
        }

        if (request_id == ban_query_request_id) {
            troublemakers = llParseString2List(body, ["::"], []);
            update_land_bans();
        }
    }
}
