// teja admin script. reads the ban list from a notecard and pushes it to the
// server.
//
// notecard format:
//
//     # lines starting with # are ignored
//     <uuid>
//     # anything after the uuid is a note
//     <uuid> spam
//
// editing the notecard re-reads it and pushes changes right away.
//

string API_BASE_URL = "https://teja.example.com"; // CHANGE ME

string ADMIN_SECRET = "change-me"; // CHANGE ME

string NOTECARD = "bans";
float RETRY_INTERVAL = 60.0;
float NAME_TIMEOUT = 10.0;

// [ uuid, username, ... ]
list bans;

// uuids waiting on a username lookup
list pending;

key notecard_query_id;
integer notecard_line;
key name_query_id;
key push_request_id;
integer last_push_status = 0;


integer is_key(string s) {
    if ((key)s) return TRUE;
    return FALSE;
}


parse_line(string line) {
    line = llStringTrim(line, STRING_TRIM);

    if (line == "" || llGetSubString(line, 0, 0) == "#") return;

    list words = llParseString2List(line, [" ", "\t"], []);
    string uuid = llToLower(llList2String(words, 0));

    if (!is_key(uuid)) {
        llOwnerSay("skipping line " + (string)(notecard_line + 1) + ", not a uuid: " + line);
        return;
    }

    if (llListFindList(pending, [uuid]) != -1) return;

    pending += uuid;
}


integer request_next_name() {
    if (pending == []) return FALSE;

    name_query_id = llRequestUsername(llList2Key(pending, 0));
    llSetTimerEvent(NAME_TIMEOUT);

    return TRUE;
}


take_pending(string username) {
    bans += [llList2String(pending, 0), username];
    pending = llDeleteSubList(pending, 0, 0);
}


push() {
    list items;
    integer i;

    for (; i < llGetListLength(bans); i += 2) {
        items += llList2Json(JSON_OBJECT, [
            "uuid", llList2String(bans, i),
            "username", llList2String(bans, i + 1)
        ]);
    }

    push_request_id = llHTTPRequest(API_BASE_URL + "/bans", [
        HTTP_METHOD, "PUT",
        HTTP_MIMETYPE, "application/json",
        HTTP_CUSTOM_HEADER, "Authorization", "Bearer " + ADMIN_SECRET
    ], llList2Json(JSON_ARRAY, items));

    // Cleared on a 200. Also covers a response that never arrives.

    llSetTimerEvent(RETRY_INTERVAL);
}


default {
    state_entry() {
        if (llGetInventoryType(NOTECARD) != INVENTORY_NOTECARD) {
            llOwnerSay("add a notecard named '" + NOTECARD + "' with one uuid per line");
            return;
        }

        llOwnerSay("reading " + NOTECARD + "...");
        notecard_query_id = llGetNotecardLine(NOTECARD, notecard_line);
    }

    dataserver(key query_id, string data) {
        if (query_id == notecard_query_id) {
            if (data == EOF) {
                if (!request_next_name()) state active;
                return;
            }

            parse_line(data);
            notecard_line += 1;
            notecard_query_id = llGetNotecardLine(NOTECARD, notecard_line);
        }

        if (query_id == name_query_id) {
            take_pending(data);
            if (!request_next_name()) state active;
        }
    }

    timer() {
        llOwnerSay("could not find a username for " + llList2String(pending, 0) + ", check the uuid");
        take_pending("");
        if (!request_next_name()) state active;
    }

    changed(integer change) {
        if (change & (CHANGED_INVENTORY | CHANGED_OWNER)) llResetScript();
    }

    on_rez(integer start_param) {
        llResetScript();
    }
}


state active {
    state_entry() {
        llOwnerSay("loaded " + (string)(llGetListLength(bans) / 2) + " bans, pushing...");
        push();
    }

    timer() {
        push();
    }

    touch_start(integer num_detected) {
        if (llDetectedKey(0) != llGetOwner()) return;

        llOwnerSay((string)(llGetListLength(bans) / 2) + " bans, last push status " + (string)last_push_status + ". pushing now...");
        last_push_status = 0;
        push();
    }

    http_response(key request_id, integer status, list metadata, string body) {
        if (request_id != push_request_id) return;

        integer repeated = status == last_push_status;
        last_push_status = status;

        if (status == 200) {
            llSetTimerEvent(0);
            return;
        }

        if (repeated) return;

        if (status == 401) {
            llOwnerSay("server rejected ADMIN_SECRET");
        } else {
            llOwnerSay("push failed with status " + (string)status + ": " + body);
        }
    }

    changed(integer change) {
        if (change & (CHANGED_INVENTORY | CHANGED_OWNER)) llResetScript();
    }

    on_rez(integer start_param) {
        llResetScript();
    }
}
