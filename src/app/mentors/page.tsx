"use client";
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, MessageCircle, Star, GraduationCap } from 'lucide-react';

export default function MentorConnect() {
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const mentors = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      specialization: 'Computer Science',
      year: 'Final Year',
      rating: 4.9,
      reviews: 45,
      expertise: ['Data Structures', 'Algorithms', 'Web Development'],
      availability: 'Available',
    },
    {
      id: 2,
      name: 'Priya Sharma',
      specialization: 'Computer Science',
      year: 'Final Year',
      rating: 4.8,
      reviews: 38,
      expertise: ['Machine Learning', 'Python', 'Database'],
      availability: 'Available',
    },
    {
      id: 3,
      name: 'Amit Patel',
      specialization: 'Information Technology',
      year: 'Final Year',
      rating: 4.7,
      reviews: 52,
      expertise: ['Cloud Computing', 'DevOps', 'System Design'],
      availability: 'Busy',
    },
    {
      id: 4,
      name: 'Sneha Reddy',
      specialization: 'Computer Science',
      year: 'Final Year',
      rating: 4.9,
      reviews: 61,
      expertise: ['Android Development', 'Java', 'Mobile Apps'],
      availability: 'Available',
    },
  ];

  const filteredMentors = mentors.filter(mentor =>
    mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Connect with Mentors</h1>
        <p className="text-gray-600 mb-8">Get guidance from experienced seniors</p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Mentors List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search */}
            <Card className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search mentors by name, field, or expertise..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </Card>

            {/* Mentor Cards */}
            {filteredMentors.map((mentor) => (
              <Card key={mentor.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-blue-600 text-white text-xl">
                      {mentor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{mentor.name}</h3>
                        <p className="text-gray-600">{mentor.specialization} - {mentor.year}</p>
                      </div>
                      <Badge variant={mentor.availability === 'Available' ? 'secondary' : 'outline'}>
                        {mentor.availability}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 mb-3 text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {mentor.rating} ({mentor.reviews} reviews)
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Expertise:</p>
                      <div className="flex flex-wrap gap-2">
                        {mentor.expertise.map((exp, idx) => (
                          <Badge key={idx} variant="outline">{exp}</Badge>
                        ))}
                      </div>
                    </div>

                    <Button 
                      size="sm" 
                      onClick={() => setSelectedMentor(mentor)}
                      disabled={mentor.availability !== 'Available'}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Chat/Message Panel */}
          <div>
            <Card className="p-6 sticky top-24">
              {selectedMentor ? (
                <div>
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {selectedMentor.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedMentor.name}</h3>
                      <p className="text-sm text-gray-600">{selectedMentor.specialization}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-4">Send a message to connect:</p>
                    <Textarea
                      placeholder="Hi, I need help with..."
                      rows={6}
                      className="mb-4"
                    />
                    <Button className="w-full">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <GraduationCap className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p>Select a mentor to start a conversation</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
