string VERSION = "2.0";

string API_BASE_URL = "https://teja.example.com"; // CHANGE ME

string CLIENT_SECRET = "changeme"; // CHANGE ME

float TIMER = 180.0;

// [ uuid, username, ... ]
list troublemakers;

list managed_bans = [];

key ban_query_request_id;

integer query_attempts = 0;

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


integer IsInList(list _list, string item) {
    return llListFindList(_list, [item]) >= 0;
}


integer is_land_owner() {
    if (llGetLandOwnerAt(llGetPos()) != llGetOwner()) {
        llSay(0, "ERROR: object owner and land owner are NOT the same... if this is group land, please deed this prim to land so that i have the right permissions. when done, click this prim again to continue setup");
        return FALSE;
    }

    return TRUE;
}


heartbeat() {
    string obj_description = llList2String(
        llGetLinkPrimitiveParams(
            llGetLinkNumber() != 0,
            [ PRIM_DESC ]),
        0);

    if (llStringTrim(obj_description, STRING_TRIM) == "no_analytics_plz") {
        return;
    }

    string url = API_BASE_URL + "/heartbeat" +
        "?version=" + llEscapeURL(VERSION);

    llHTTPRequest(url, [
        HTTP_CUSTOM_HEADER, "Authorization", "Bearer " + CLIENT_SECRET
    ], "");
}

query_bans() {
    ban_query_request_id = llHTTPRequest(API_BASE_URL + "/bans", [
        HTTP_BODY_MAXLENGTH, 16384,
        HTTP_CUSTOM_HEADER, "Authorization", "Bearer " + CLIENT_SECRET
    ], "");
}

update_land_bans() {
    list ban_uuids = StrideOfList(troublemakers, 2, 0, -1);

    list managed_bans_copy = llList2List(managed_bans, 0, -1);

    // handle revoked ban
    integer i;
    for (; i < llGetListLength(managed_bans_copy); i++) {
        key uuid = llList2Key(managed_bans_copy, i);

        if (!IsInList(ban_uuids, uuid)) {
            // llSay(0, "unbanning " + (string)uuid);
            llRemoveFromLandBanList(uuid);
            managed_bans = ListItemDelete(managed_bans, uuid);
        }
    }

    // handle new ban
    integer j;
    for (; j < llGetListLength(ban_uuids); j++) {
        key uuid = llList2Key(ban_uuids, j);

        if (!IsInList(managed_bans, uuid)) {
            llAddToLandBanList(uuid, 0);
            // llSay(0, "banning " + (string)uuid);
            managed_bans += uuid;
        }
    }
}


default {
    state_entry() {
        llSay(0, "teja will check for bans and push stats every " + (string)TIMER + " seconds. if you want to opt out of analytics, set description of prim to 'no_analytics_plz'. click me to start setup~");

        llSetTimerEvent(120);
    }

    touch_start(integer num_detected) {
        if (is_land_owner()) {
            state active;
        }
    }

    timer() {
        llSay(0, "teja is not set up yet... click me to continue");
    }
}


state active {
    state_entry() {
        query_bans();
        heartbeat();

        llSetTimerEvent(TIMER);

        llSay(0, "teja client OK! check " + API_BASE_URL + "/status for status.");
    }

    timer() {
        query_bans();
        heartbeat();
    }

    http_response(key request_id, integer status, list metadata, string body) {
        if (request_id != ban_query_request_id) return;

        if (status != 200) {
            query_attempts += 1;

            if (query_attempts == 3) {
                if (status == 401) {
                    llSay(0, "teja server rejected CLIENT_SECRET...");
                } else {
                    llSay(0, "teja server is not responding (status " + (string)status + ")...");
                }
            }

            return;
        }

        query_attempts = 0;

        // keep nulls so an empty username doesn't shift the stride.
        troublemakers = [];
        if (body != "") troublemakers = llParseStringKeepNulls(body, ["::"], []);

        update_land_bans();
    }
}
