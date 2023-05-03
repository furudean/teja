string API_BASE_URL = "https://teja.himawari.fun";
string VERSION = "1";

// [ uuid, object_return, username, ... ]
list troublemakers;

list managed_bans = [];

key ban_query_request_id;

query_bans() {
    ban_query_request_id = llHTTPRequest(API_BASE_URL + "/bans", [], "");
}

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

update_land_bans() {
    list uuids = StrideOfList(troublemakers, 3, 0, -1);
    list return_items = StrideOfList(troublemakers, 3, 1, -1);
    list usernames = StrideOfList(troublemakers, 3, 2, -1);    
    
    list managed_bans_clone = llList2List(managed_bans, 0, -1);
    integer managed_bans_length = llGetListLength(managed_bans_clone);
    
    // unban
    integer i;
    for (;i < managed_bans_length;i++) {
        key uuid = llList2Key(managed_bans_clone, i);

        if (llListFindList(uuids, [uuid]) == -1) {
            llRemoveFromLandBanList(uuid);
            managed_bans = ListItemDelete(managed_bans, uuid);
        }
    }
    
    integer strides = llGetListLength(troublemakers) / 3;

    // ban
    integer j;
    for (;j < strides;j++) {
        key uuid = llList2Key(uuids, j);
        
        if (llListFindList(uuids, [uuid]) == -1) {
            llAddToLandBanList(uuid, 0);
            managed_bans += uuid;
        }
    }
}

heartbeat() {
    llHTTPRequest(API_BASE_URL + "/heartbeat", [], VERSION);
}

default
{
    state_entry()
    {
        query_bans();
        heartbeat();
        llSetTimerEvent(60.0);
        
        llSay(0, "teja ban client online!");
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
    
    timer() {
        query_bans();
        heartbeat();
    }
}
