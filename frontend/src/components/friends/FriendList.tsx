import React, { useEffect, useState } from 'react';
import { friendService, Friend, FriendRequest } from '../../services/friend';

const FriendList: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFriendsAndRequests();
  }, []);

  const loadFriendsAndRequests = async () => {
    try {
      const [friendsData, requestsData] = await Promise.all([
        friendService.getFriends(),
        friendService.getPendingRequests()
      ]);
      setFriends(friendsData);
      setPendingRequests(requestsData);
    } catch (err) {
      setError('Failed to load friends and requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await friendService.acceptFriendRequest(requestId);
      await loadFriendsAndRequests();
    } catch (err) {
      setError('Failed to accept friend request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await friendService.rejectFriendRequest(requestId);
      await loadFriendsAndRequests();
    } catch (err) {
      setError('Failed to reject friend request');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4">
      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                <div>
                  <p className="font-medium">{request.name}</p>
                  <p className="text-gray-500 text-sm">{request.email}</p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleAcceptRequest(request.id)}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Friends</h2>
        {friends.length === 0 ? (
          <p className="text-gray-500">No friends added yet</p>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {friends.map((friend) => (
              <div key={friend.id} className="p-4 bg-white rounded-lg shadow">
                <p className="font-medium">{friend.name}</p>
                <p className="text-gray-500 text-sm">{friend.email}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendList;