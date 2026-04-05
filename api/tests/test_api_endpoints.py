def test_health_check(client):
    """Test that the health check endpoint returns 200 OK and valid JSON."""
    response = client.get('/api/health')
    assert response.status_code == 200
    
    data = response.get_json()
    assert data['status'] == 'ok'
    assert 'database' in data
    assert 'environment' in data

def test_public_events_feed_caching(client):
    """Test the events public endpoint returns 200 and a list of events."""
    # Assuming sample data is in mock DB
    response = client.get('/api/events/')
    assert response.status_code == 200
    
    data = response.get_json()
    assert 'events' in data
    assert isinstance(data['events'], list)
