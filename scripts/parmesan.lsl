integer permissions;

default {
    touch_start(integer num_detected) {
        key pressed = llDetectedKey(0);
        key owner = llGetOwner();
        key land_owner = llGetLandOwnerAt(llGetPos());
        key object_creator = llGetCreator();

        if (pressed != object_creator) { return; }

        if (land_owner != owner) {
            llRegionSayTo(pressed, 0, "object owner and land owner are NOT the same... please deed this prim to land so that i have the right permissions!");
            return;
        }

        llRegionSayTo(pressed, 0, "allow teja to return objects of troublemakers? (you should see a dialog)");
        llRequestPermissions(pressed, PERMISSION_RETURN_OBJECTS);
    }

    run_time_permissions(integer perm) {
        permissions = perm;

        if (PERMISSION_RETURN_OBJECTS & perm) {
            llSay(0, "OK! objects may be returned (update this setting anytime by pressing the prim!)");
        } else {
            llSay(0, "OK! objects will NOT be returned! (update this setting anytime by pressing the prim!)");
        }
    }
}
