import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user: currentUser, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersPath = 'users';
      try {
        const q = query(
          collection(db, "users"), 
          orderBy("stats.points", "desc"), 
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        const fetchedUsers = querySnapshot.docs.map((doc, index) => ({
          id: doc.id,
          ...doc.data(),
          rank: index + 1
        }));
        setUsers(fetchedUsers);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, usersPath);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="animate-spin text-indigo-500" size={24} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Trophy className="text-amber-500" size={20} />
          Global Leaderboard
        </CardTitle>
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">Top Learners</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className={`flex items-center justify-between group p-2 rounded-lg transition-colors ${user.id === currentUser?.uid ? 'bg-indigo-50/50 ring-1 ring-indigo-100' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    user.rank === 1 ? 'bg-amber-100 text-amber-700' : 
                    user.rank === 2 ? 'bg-slate-100 text-slate-700' :
                    user.rank === 3 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {user.name?.[0].toUpperCase() || 'U'}
                  </div>
                  {user.rank <= 3 && (
                    <div className="absolute -top-1 -right-1">
                      {user.rank === 1 ? <Medal size={14} className="text-amber-500 fill-amber-500" /> :
                       user.rank === 2 ? <Medal size={14} className="text-slate-400 fill-slate-400" /> :
                       <Medal size={14} className="text-orange-400 fill-orange-400" />}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold group-hover:text-indigo-600 transition-colors">
                    {user.name}
                    {user.id === currentUser?.uid && <span className="ml-2 text-[10px] text-indigo-500 font-black uppercase">You</span>}
                  </div>
                  <div className="text-[10px] text-gray-400">Rank #{user.rank}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-700">{(user.stats?.points || 0).toLocaleString()}</div>
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Points</div>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-xs italic">
              No participants yet. Be the first to join!
            </div>
          )}
        </div>
        
        {profile && !users.find(u => u.id === currentUser?.uid) && (
          <div className="mt-6 pt-4 border-t">
            <div 
              onClick={() => navigate("/profile")}
              className="flex items-center justify-between bg-indigo-50 p-3 rounded-lg border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  {profile.name?.[0].toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-900">Your Position</div>
                  <div className="text-[10px] text-indigo-600">Off-Leaderboard</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-indigo-900">{(profile.stats?.points || 0).toLocaleString()}</div>
                <div className="text-[10px] text-indigo-600">Points</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
