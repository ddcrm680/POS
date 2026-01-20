"use client";
import Store from "./store";


export default function StoreList() {


    return (
        <div>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <div className="  p-3">
                    <div className="mx-auto space-y-3">
                        <div className=" flex flex-col  ">
                            <div className="mb-6">
                                <div>
                                    <h1 className="
text-lg font-semibold
">
                                        Store List
                                    </h1>
                                    <p className="text-muted-foreground text-sm">
                                        Control and manage all registered stores
                                    </p>
                                </div>
                            </div>
                            <Store />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
