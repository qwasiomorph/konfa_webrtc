import type { User } from '../types/types';

type UserListProps = {
  users: User[];
  onUserSelect: (user: User) => void;
};

export default function UserList({ users, onUserSelect }: UserListProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Online Users</h2>
      </div>
      
      <ul className="divide-y">
        {users.map((user) => (
          <li 
            key={user.id} 
            className="p-3 hover:bg-gray-50 cursor-pointer flex items-center"
            onClick={() => onUserSelect(user)}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              {user.isCalling && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <div className="ml-3">
              <p className="font-medium">{user.username}</p>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}